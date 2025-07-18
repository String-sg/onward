<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  interface Props {
    /**
     * The URL to navigate to when the user clicks on the floating player.
     */
    to: string;
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
  }

  let { to, title, isplaying = false, onplay }: Props = $props();

  const handlePlay: MouseEventHandler<HTMLButtonElement> = (event) => {
    // Prevent the default behavior of the anchor tag from navigating to the URL.
    event.preventDefault();

    onplay?.(event);
  };
</script>

<a
  href={to}
  class="inset-shadow-sm flex items-center gap-x-3 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm"
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
</a>
