<script lang="ts">
  import { ChevronDown, SendHorizontal } from '@lucide/svelte';
  import DOMPurify from 'dompurify';
  import { marked } from 'marked';
  import type { MouseEventHandler } from 'svelte/elements';
  import { fade, fly } from 'svelte/transition';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { Badge } from '$lib/components/Badge/index.js';
  import { Portal } from '$lib/components/Portal/index.js';
  import { IsWithinViewport } from '$lib/helpers/index.js';

  interface ChatMessage {
    role: 'USER' | 'ASSISTANT';
    content: string;
  }

  export interface Props {
    /**
     * Indicates whether the view is open.
     */
    isopen: boolean;
    /**
     * A callback invoked when the view is closed.
     */
    onclose: () => void;
  }

  const { isopen, onclose }: Props = $props();

  let target = $state<HTMLElement | null>(null);
  let query = $state('');
  let messages = $state<ChatMessage[]>([]);
  let isAiTyping = $state(false);
  let textareaElement = $state<HTMLTextAreaElement | null>(null);

  let isUserTyping = $derived(query.trim());

  let isMessagesFetched = false;

  const isWithinViewport = new IsWithinViewport(() => target);

  // Disable scrolling when view is open.
  $effect(() => {
    document.body.style.overflow = isopen ? 'hidden' : '';
  });

  // Auto resize textarea.
  $effect(() => {
    if (!textareaElement) return;

    textareaElement.style.height = 'auto';
    textareaElement.style.height = query ? `${Math.min(textareaElement.scrollHeight, 96)}px` : '';
  });

  // Fetch messages when view is opened for the first time.
  $effect(() => {
    if (isopen && !isMessagesFetched) {
      const fetchMessages = async () => {
        try {
          const response = await fetch('/api/messages', {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              return goto('/login');
            }

            console.error('Failed to fetch messages');
            return;
          }

          const data = await response.json();
          messages = data.messages;
        } catch (err) {
          console.error(err);
        }
      };

      fetchMessages();
      isMessagesFetched = true;
    }
  });

  const handleClose: MouseEventHandler<HTMLButtonElement> = () => {
    onclose();
  };

  const handleSendQuery = async () => {
    if (!query.trim()) return;

    messages.push({ role: 'USER', content: query });
    isAiTyping = true;
    const bodyParams = { query };
    query = '';

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(bodyParams),
      });

      if (!response.ok) {
        if (response.status === 401) {
          return goto('/login');
        }

        console.error('Failed to send query');
        return;
      }

      const result = await response.json();
      messages.push(result);
    } catch (err) {
      console.error(err);
    } finally {
      query = '';
      isAiTyping = false;
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      // Prevent default behavior of creating a new line within textarea.
      event.preventDefault();

      handleSendQuery();
    }
  };

  const handleClear = async () => {
    try {
      const response = await fetch('/api/messages', {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return goto('/login');
        }

        console.error('Failed to clear messages');
        return;
      }

      messages = [];
    } catch (err) {
      console.error(err);
    }
  };
</script>

<Portal>
  {#if isopen}
    <!-- Backdrop -->
    <div transition:fade={{ duration: 300 }} class="fixed inset-0 z-199 bg-slate-950/50"></div>

    <!-- Modal -->
    <div
      class="fixed inset-0 z-200 bg-slate-100"
      transition:fly={{ duration: 300, y: '100%', opacity: 1 }}
    >
      <header class="fixed inset-x-0 top-0 z-250 flex backdrop-blur-sm">
        <div
          class={[
            'inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
            !isWithinViewport.current && '!bg-slate-950/7.5',
          ]}
        ></div>

        <div class="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div class="flex items-center gap-x-2">
            <button
              onclick={handleClose}
              class="cursor-pointer rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
            >
              <ChevronDown />
            </button>

            <Badge variant="slate-dark">Ask AI</Badge>
          </div>

          {#if messages.length > 0}
            <button
              onclick={handleClear}
              class="cursor-pointer rounded-full p-4 font-bold transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
            >
              Clear
            </button>
          {/if}
        </div>
      </header>

      <div class="relative mx-auto min-h-full w-full max-w-5xl pt-23">
        <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

        <!-- TODO: temporary hardcode height for now. To relook at how to set this height without hardcoding an arbitrary height -->
        <div class="h-[calc(100svh-180px)] overflow-y-auto px-4 pt-3">
          <div class="flex flex-col gap-y-4">
            {#if messages.length === 0}
              <span class="text-center text-xl font-medium">
                {`Hi${page.data.username ? ` ${page.data.username}` : ''}! How can I assist you today?`}
              </span>
            {/if}

            <div class="flex flex-col gap-y-2.5">
              {#each messages as { role, content }, index (index)}
                <div class={['flex flex-col', role === 'USER' && 'items-end']}>
                  <span
                    class={[
                      'prose prose-slate rounded-3xl p-4 text-left break-words',
                      role === 'USER' && 'max-w-4/5 bg-white',
                    ]}
                  >
                    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                    {@html DOMPurify.sanitize(marked.parse(content, { async: false }))}
                  </span>
                </div>
              {/each}

              {#if isAiTyping}
                <span class="rounded-3xl p-4 text-left">AI is typing...</span>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <div class="fixed inset-x-0 bottom-0">
        <div class="mx-auto w-full max-w-5xl px-4 py-3">
          <div
            class={[
              'pointer-events-auto flex items-center gap-x-3 rounded-4xl border border-slate-100 bg-white/30 p-3 shadow-lg inset-shadow-sm inset-shadow-slate-200 backdrop-blur-sm',
              !isAiTyping &&
                'transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
            ]}
          >
            <textarea
              bind:value={query}
              bind:this={textareaElement}
              name="query"
              class="w-full resize-none items-center px-3 outline-0"
              placeholder="Ask questions about a topic"
              onkeydown={handleKeyDown}
              rows="1"
              disabled={isAiTyping}
            >
            </textarea>

            <button
              class="cursor-pointer rounded-full bg-slate-950 p-4 text-white transition-colors hover:bg-slate-900/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed disabled:pointer-events-none disabled:bg-slate-900/50"
              disabled={!isUserTyping || isAiTyping}
              onclick={handleSendQuery}
            >
              <SendHorizontal />
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</Portal>
