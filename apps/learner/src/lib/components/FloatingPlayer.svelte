<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  interface Props {
    /**
     * The title of the podcast.
     */
    title: string;
    /**
     * Indicates whether the player is in a playing or paused state.
     */
    isplaying?: boolean;
    /**
     * A callback function that is called when the user clicks on the play button.
     */
    onplay?: MouseEventHandler<HTMLButtonElement>;
    /**
     * A callback function that is called when the user clicks on the floating player.
     */
    onclick?: () => void;
  }

  let { title, isplaying = false, onplay, onclick }: Props = $props();

  const handlePlay: MouseEventHandler<HTMLButtonElement> = (event) => {
    // Prevent the default behavior of the anchor tag from navigating to the URL.
    event.preventDefault();

    onplay?.(event);
  };

  const handleClick = () => {
    onclick?.();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      // Prevent the default behavior of scrolling.
      event.preventDefault();
    }

    if (event.key === 'Enter' || event.key === ' ') {
      onclick?.();
    }
  };
</script>

<div
  role="button"
  tabindex="0"
  onclick={handleClick}
  onkeydown={handleKeyDown}
  class="inset-shadow-sm inset-shadow-slate-200 flex items-center gap-x-3 rounded-full px-3 py-3.5 shadow-lg backdrop-blur-sm"
>
  <!-- Temporary album placeholder -->
  <div class="h-12 w-12 rounded-full bg-black"></div>

  <div class="flex-1 truncate text-sm font-medium">
    {title}
  </div>

  <button
    class="flex cursor-pointer items-center rounded-full px-4 py-2 hover:bg-slate-50"
    onclick={handlePlay}
  >
    {#if isplaying}
      <Pause />
    {:else}
      <Play />
    {/if}
  </button>
</div>
