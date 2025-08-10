<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  interface Props {
    /**
     * The title of the current playing track.
     */
    title: string;
    /**
     * Indicates whether to display the play/pause button.
     */
    isplaying: boolean;
    /**
     * A callback for clicking the entire component, excluding the play/pause button.
     */
    onclick: () => void;
    /**
     * A callback for clicking the play/pause button.
     */
    onplay: () => void;
  }

  let { title, isplaying = false, onclick, onplay }: Props = $props();

  const handleClick = () => {
    onclick();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      // Prevent default scrolling behaviour.
      event.preventDefault();
    }

    if (event.key === 'Enter' || event.key === ' ') {
      onclick();
    }
  };

  const handlePlay: MouseEventHandler<HTMLButtonElement> = (event) => {
    // Stop the event from bubbling up to the parent element.
    event.stopPropagation();

    onplay();
  };
</script>

<div
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={handleKeyDown}
  class="inset-shadow-sm inset-shadow-slate-200 pointer-events-auto grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-3 rounded-full bg-white/30 px-3 py-3.5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
>
  <!-- Temporary image placeholder -->
  <div class="h-12 w-12 rounded-full bg-black"></div>

  <span class="truncate text-sm font-medium">
    {title}
  </span>

  <button
    class="flex cursor-pointer items-center rounded-full p-2 transition-colors hover:bg-slate-100"
    onclick={handlePlay}
  >
    {#if isplaying}
      <Pause />
    {:else}
      <Play />
    {/if}
  </button>
</div>
