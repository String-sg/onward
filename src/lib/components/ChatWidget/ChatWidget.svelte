<script lang="ts">
  import { Sparkles } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  import { Button } from '$lib/components/ui/button/index.js';

  export interface Props {
    /**
     * A callback invoked when the widget is clicked.
     */
    onclick: () => void;
  }

  let { onclick }: Props = $props();

  const handleClick: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> = () => {
    onclick();
  };
</script>

<Button
  onclick={handleClick}
  class="pointer-events-auto flex !h-[72px] !w-[72px] cursor-pointer items-center justify-center rounded-full bg-white/80 !p-0 shadow-[inset_0_2px_2px_rgba(255,255,255,0.4),inset_0_4px_12px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(226,226,226,0.5),0_4px_4.4px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
  variant="ghost"
  aria-label="Open chat"
>
  <Sparkles class="size-6" />
</Button>
