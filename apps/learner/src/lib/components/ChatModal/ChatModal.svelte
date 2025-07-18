<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  import { Badge } from '$lib/components/Badge/index.js';
  import { useIsWithinViewport } from '$lib/helpers/index.js';

  let target = $state<HTMLElement | null>(null);

  const isWithinViewport = useIsWithinViewport(() => target);

  export interface Props {
    /**
     * A callback function that is called when the user clicks on the Back button.
     */
    onclose?: MouseEventHandler<HTMLButtonElement>;
  }

  let { onclose }: Props = $props();
</script>

<div class="z-100 fixed inset-0 bg-slate-100">
  <header class="inset-x-0 top-0 flex bg-slate-100 backdrop-blur-sm">
    <div
      class={[
        'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
        target && !isWithinViewport.current && '!bg-slate-950/7.5',
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

    <div class="flex flex-col gap-y-4">
      <span class="text-xl font-medium">
        Hi Mr. Tan, here are some of the example questions relevant to Special Educational Needs
        topic.
      </span>

      <div class="flex flex-col gap-y-2.5">
        <div class="rounded-3xl bg-white p-4">
          <span>
            “What are three quick strategies for teaching reading to a student with dyslexia in a
            mainstream classroom?"
          </span>
        </div>

        <div class="rounded-3xl bg-white p-4">
          <span>
            “How can I create a sensory-friendly classroom for students with autism spectrum
            disorder?”
          </span>
        </div>
      </div>
    </div>
  </main>
</div>
