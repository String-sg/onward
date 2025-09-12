<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  import { Badge, type BadgeProps } from '$lib/components/Badge/index.js';
  import { Button } from '$lib/components/Button/index.js';

  export interface Props {
    /**
     * The URL to navigate to when clicking the card.
     */
    to: string;
    /**
     * The tags to display on the card.
     */
    tags: { variant: BadgeProps['variant']; content: string }[];
    /**
     * The title of the card.
     */
    title: string;
    /**
     * The creator of the card.
     */
    createdBy: string;
    /**
     * An optional player object for showing playback controls and progress.
     * If provided, displays the controls and progress.
     */
    player?: {
      /**
       * Indicates whether this learning unit is the active track.
       */
      isactive: boolean;
      /**
       * Indicates whether this learning unit is playing.
       */
      isplaying: boolean;
      /**
       * A callback to start playback.
       */
      onplay: () => void;
      /**
       * A callback to pause playback.
       */
      onpause: () => void;
      /**
       * A callback to resume playback.
       */
      onresume: () => void;
    } | null;
  }

  let { to, title, tags, createdBy, player = null }: Props = $props();

  const handlePlay: MouseEventHandler<HTMLButtonElement> = (event) => {
    // Prevent default anchor navigation.
    event.preventDefault();

    player?.onplay();
  };

  const handlePause: MouseEventHandler<HTMLButtonElement> = (event) => {
    // Prevent default anchor navigation.
    event.preventDefault();

    player?.onpause();
  };

  const handleResume: MouseEventHandler<HTMLButtonElement> = (event) => {
    // Prevent default anchor navigation.
    event.preventDefault();

    player?.onresume();
  };
</script>

<a
  href={to}
  class="shadow-xs flex flex-col gap-y-6 rounded-3xl bg-white p-6 transition-shadow hover:ring-1 hover:ring-slate-300 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
>
  <div class="flex flex-col gap-y-2">
    <div class="flex flex-wrap gap-1">
      {#each tags as tag (tag.content)}
        <Badge variant={tag.variant}>{tag.content}</Badge>
      {/each}
    </div>

    <div class="flex flex-col gap-y-3">
      <span class="text-xl font-medium text-slate-950">
        {title}
      </span>

      <div class="flex gap-x-1">
        <span class="text-sm text-slate-600">{createdBy}</span>
        <span class="text-sm text-slate-600">•</span>
        <span class="text-sm text-slate-600">2 days ago</span>
      </div>
    </div>
  </div>

  {#if player}
    <div class="flex items-center gap-x-3">
      {#if player.isactive && player.isplaying}
        <Button variant="secondary" onclick={handlePause}>
          <Pause class="h-4 w-4" />
          <span class="font-medium">Pause</span>
        </Button>
      {:else if player.isactive && !player.isplaying}
        <Button variant="secondary" onclick={handleResume}>
          <Play class="h-4 w-4" />
          <span class="font-medium">Resume</span>
        </Button>
      {:else}
        <Button variant="secondary" onclick={handlePlay}>
          <Play class="h-4 w-4" />
          <span class="font-medium">Play</span>
        </Button>
      {/if}

      <div class="flex items-center gap-x-2">
        <svg viewBox="0 0 24 24" class="h-6 w-6">
          <circle cx="12" cy="12" r="9" stroke="#E2E8F0" fill="none" stroke-width="3px" />
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="#020617"
            fill="none"
            stroke-width="3px"
            stroke-dasharray="56.55"
            stroke-dashoffset="12"
            transform-origin="center"
            transform="rotate(-90 0 0)"
          />
        </svg>

        <span class="text-sm text-slate-600">23m left</span>
      </div>
    </div>
  {/if}
</a>
