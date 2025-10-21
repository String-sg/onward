<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  import playerImage from '$lib/assets/player-image.png';

  export interface Props {
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
  class="pointer-events-auto grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-3 rounded-full bg-white/80 p-3 shadow-[inset_0_2px_2px_rgba(255,255,255,0.4),inset_0_4px_12px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(226,226,226,0.5),0_4px_4.4px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
>
  <img src={playerImage} alt="Player cover" class="h-12 w-12 rounded-full" />

  <span class="line-clamp-2 text-sm font-medium">
    {title}
  </span>

  <button
    class="flex cursor-pointer items-center rounded-full p-2 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
    onclick={handlePlay}
  >
    {#if isplaying}
      <Pause />
    {:else}
      <Play />
    {/if}
  </button>
</div>
