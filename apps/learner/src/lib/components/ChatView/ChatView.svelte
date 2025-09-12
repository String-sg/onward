<script lang="ts">
  import { ChevronDown, SendHorizontal } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';
  import { fade, fly } from 'svelte/transition';

  import { Badge } from '$lib/components/Badge/index.js';
  import { Portal } from '$lib/components/Portal/index.js';
  import { IsWithinViewport } from '$lib/helpers/index.js';

  import type { Role } from '../../../generated/enums';

  interface ChatMessage {
    role: Role;
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
  let thread = $state<ChatMessage[]>([]);
  let isAiTyping = $state(false);
  let textareaElement = $state<HTMLTextAreaElement | null>(null);

  let isUserTyping = $derived(query.trim());

  let isMessagesFetched = false;

  const isWithinViewport = new IsWithinViewport(() => target);

  const recommendedQueries = [
    'What are three quick strategies for teaching reading to a student with dyslexia in a mainstream classroom?',
    'How can I create a sensory-friendly classroom for students with autism spectrum disorder?',
  ];

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

  $effect(() => {
    if (isopen && !isMessagesFetched) {
      isMessagesFetched = true;

      fetch('/api/messages', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error();
          }
          return response.json();
        })
        .then((data) => {
          thread = data.messages;
        })
        .catch(() => {
          thread.push({
            role: 'ASSISTANT',
            content: 'Sorry, I encountered an error while getting your messages. Please try again.',
          });
        });
    }
  });

  const handleClose: MouseEventHandler<HTMLButtonElement> = () => {
    onclose();
  };

  const handleSendQuery = async () => {
    if (!query.trim()) return;

    thread.push({ role: 'USER', content: query });
    isAiTyping = true;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ role: 'USER', content: query }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const result = await response.json();
      thread.push(result);
    } catch {
      thread.push({
        role: 'ASSISTANT',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
      });
    } finally {
      query = '';
      isAiTyping = false;
    }
  };

  const handleRecommendedQuery = (recommendedQuery: string) => {
    query = recommendedQuery;
    handleSendQuery();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      // Prevent default behavior of creating a new line within textarea.
      event.preventDefault();

      handleSendQuery();
    }
  };

  const handleClear = () => {
    thread = [];
  };
</script>

<Portal>
  {#if isopen}
    <!-- Backdrop -->
    <div transition:fade={{ duration: 300 }} class="z-199 fixed inset-0 bg-slate-950/50"></div>

    <!-- Modal -->
    <div
      class="z-200 fixed inset-0 bg-slate-100"
      transition:fly={{ duration: 300, y: '100%', opacity: 1 }}
    >
      <header class="z-250 fixed inset-x-0 top-0 flex backdrop-blur-sm">
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
              class="cursor-pointer rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
            >
              <ChevronDown />
            </button>

            <Badge variant="slate-dark">Ask AI</Badge>
          </div>

          {#if thread.length > 0}
            <button
              onclick={handleClear}
              class="cursor-pointer rounded-full p-4 font-bold transition-colors hover:bg-slate-200 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
            >
              Clear
            </button>
          {/if}
        </div>
      </header>

      <div class="pt-23 relative mx-auto min-h-full w-full max-w-5xl">
        <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

        <!-- TODO: temporary hardcode height for now. To relook at how to set this height without hardcoding an arbitrary height -->
        <div class="h-[calc(100vh-180px)] overflow-y-auto px-4 pt-3">
          <div class="flex flex-col gap-y-4">
            {#if thread.length === 0}
              <span class="text-xl font-medium">
                Hi Mr. Tan, here are some of the example questions relevant to Special Educational
                Needs topic.
              </span>
            {/if}

            <div class="flex flex-col gap-y-2.5">
              {#if thread.length === 0}
                {#each recommendedQueries as recommendedQuery, index (index)}
                  <button
                    class="cursor-pointer rounded-3xl bg-white p-4 text-left hover:bg-slate-50 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
                    onclick={() => handleRecommendedQuery(recommendedQuery)}
                  >
                    {recommendedQuery}
                  </button>
                {/each}
              {/if}

              {#each thread as { role, content }, index (index)}
                <div class={['flex flex-col', role === 'USER' && 'items-end']}>
                  <span
                    class={[
                      'break-words rounded-3xl p-4 text-left',
                      role === 'USER' && 'max-w-4/5 bg-white',
                    ]}
                  >
                    {content}
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
              'inset-shadow-sm inset-shadow-slate-200 rounded-4xl pointer-events-auto flex items-center gap-x-3 border border-slate-100 bg-white/30 p-3 shadow-lg backdrop-blur-sm',
              !isAiTyping &&
                'transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
            ]}
          >
            <textarea
              bind:value={query}
              bind:this={textareaElement}
              name="query"
              class="w-full resize-none items-center px-3 outline-0"
              placeholder="Ask AI about SEN"
              onkeydown={handleKeyDown}
              rows="1"
              disabled={isAiTyping}
            >
            </textarea>

            <button
              class="cursor-pointer rounded-full bg-slate-950 p-4 text-white transition-colors hover:bg-slate-900/70 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 disabled:pointer-events-none disabled:bg-slate-900/50"
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
