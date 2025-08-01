<script lang="ts">
  import { ArrowLeft, Plus, SendHorizontal } from '@lucide/svelte';
  import { onDestroy, onMount } from 'svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  import { Badge } from '$lib/components/Badge/index.js';
  import { useIsWithinViewport } from '$lib/helpers/index.js';

  interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
  }

  let target = $state<HTMLElement | null>(null);

  let prompt = $state('');
  let convo = $state<ChatMessage[]>([]);
  let isTypingPrompt = $derived(prompt.trim());
  let isAiTyping = $state(false);

  const isWithinViewport = useIsWithinViewport(() => target);

  export interface Props {
    /**
     * A callback function that is called when the user clicks on the Back button.
     */
    onclose?: MouseEventHandler<HTMLButtonElement>;
  }

  let { onclose }: Props = $props();

  const disableScroll = () => {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none'; // For mobile devices
  };

  const enableScroll = () => {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  };

  const handleSendPrompt = () => {
    convo = [...convo, { role: 'user', content: prompt }];
    prompt = '';

    // Set AI typing state to true
    isAiTyping = true;

    setTimeout(() => {
      convo = [
        ...convo,
        {
          role: 'assistant',
          content: 'Chat is currently under development, please try again later.',
        },
      ];
      isAiTyping = false;
    }, 1000);
  };

  // Disable scrolling when component mounts
  onMount(() => {
    disableScroll();
  });

  // Re-enable scrolling when component is destroyed
  onDestroy(() => {
    enableScroll();
  });
</script>

<div class="z-100 fixed inset-0 bg-slate-100">
  <header class="inset-x-0 top-0 flex backdrop-blur-sm">
    <div
      class={[
        'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
        !isWithinViewport.current && '!bg-slate-950/7.5',
      ]}
    ></div>

    <div class="mx-auto flex w-full max-w-5xl items-center gap-x-2 px-4 py-3">
      <button
        onclick={onclose}
        class="cursor-pointer rounded-full p-4 transition-colors hover:bg-slate-200"
      >
        <ArrowLeft />
      </button>

      <Badge variant="darkSlate">Ask AI</Badge>
    </div>
  </header>

  <main class="pb-23 relative mx-auto min-h-full w-full max-w-5xl px-4 pt-3">
    <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

    {#if convo.length === 0}
      <div class="flex flex-col gap-y-4">
        <span class="text-xl font-medium">
          Hi Mr. Tan, here are some of the example questions relevant to Special Educational Needs
          topic.
        </span>

        <div class="flex flex-col gap-y-2.5">
          <button class="rounded-3xl bg-white p-4 text-left">
            “What are three quick strategies for teaching reading to a student with dyslexia in a
            mainstream classroom?"
          </button>

          <button class="rounded-3xl bg-white p-4 text-left">
            “How can I create a sensory-friendly classroom for students with autism spectrum
            disorder?”
          </button>
        </div>
      </div>
    {:else}
      <div class="gap-y-2.5">
        {#each convo as { role, content }, index (index)}
          <div class={['flex flex-col', role === 'user' && 'items-end']}>
            <span class={['rounded-3xl  p-4 text-left', role === 'user' && 'max-w-4/5 bg-white']}>
              {content}
            </span>
          </div>
        {/each}
        {#if isAiTyping}
          <div class="flex flex-col">
            <span class="font-italic font-xs">AI is typing...</span>
          </div>
        {/if}
      </div>
    {/if}
  </main>

  <div class="fixed inset-x-0 bottom-0 z-50">
    <div class="mx-auto w-full max-w-5xl px-4 py-3">
      <div
        class="inset-shadow-sm inset-shadow-slate-200 flex items-center gap-x-3 rounded-full border border-slate-100 p-3 shadow-lg backdrop-blur-sm hover:border-slate-300"
      >
        <button class="cursor-pointer rounded-full p-3 transition-colors hover:bg-slate-200">
          <Plus />
        </button>

        <textarea
          bind:value={prompt}
          name="prompt"
          class="w-full resize-none items-center py-3 outline-0"
          placeholder="Ask AI about SEN"
          rows="1"
        >
        </textarea>

        <button
          class="cursor-pointer rounded-full bg-slate-950 p-4 text-white transition-colors hover:bg-slate-900/90 disabled:pointer-events-none disabled:bg-slate-900/50"
          disabled={!isTypingPrompt}
          onclick={handleSendPrompt}
        >
          <SendHorizontal />
        </button>
      </div>
    </div>
  </div>
</div>
