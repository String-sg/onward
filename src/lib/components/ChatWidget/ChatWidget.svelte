<script lang="ts">
  import { Sparkles } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  export interface Props {
    /**
     * A callback invoked when the widget is clicked.
     */
    onclick: () => void;
  }

  let { onclick }: Props = $props();

  const handleClick: MouseEventHandler<HTMLButtonElement> = () => {
    onclick();
  };
</script>

<button
  onclick={handleClick}
  class="pointer-events-auto flex cursor-pointer items-center justify-center rounded-full bg-white/80 p-6 shadow-[inset_0_2px_2px_rgba(255,255,255,0.4),inset_0_4px_12px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(226,226,226,0.5),0_4px_4.4px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-transform hover:-translate-y-0.5"
  aria-label="Open chat"
>
  <Sparkles />
</button>
