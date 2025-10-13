<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';
  import { formatDistanceToNow } from 'date-fns';
  import type { MouseEventHandler } from 'svelte/elements';

  import { Badge, type BadgeProps } from '$lib/components/Badge/index.js';
  import { Button } from '$lib/components/Button/index.js';
  import { ProgressSpinner } from '$lib/components/ProgressSpinner/index.js';

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
     * The time at which the card is created.
     */
    createdat: Date;
    /**
     * The creator of the card.
     */
    createdby: string;
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
      /**
       * The time remaining in the playback.
       */
      timeremaining: number;
      /**
       * The duration of the playback.
       */
      duration: number;
    } | null;
  }

  let { to, title, tags, createdat, createdby, player = null }: Props = $props();

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

  const formatTimeRemaining = (timeInSeconds: number): string => {
    if (timeInSeconds <= 0) return '0 mins left';
    if (timeInSeconds < 60) return '< 1 min left';
    const minutes = Math.ceil(timeInSeconds / 60);
    const unit = minutes === 1 ? 'min' : 'mins';
    return `${minutes} ${unit} left`;
  };
</script>

<a
  href={to}
  class="flex flex-col gap-y-6 rounded-3xl bg-white p-6 shadow-xs transition-shadow hover:ring-1 hover:ring-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
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
        <span class="text-sm text-slate-600">{createdby}</span>
        <span class="text-sm text-slate-600">•</span>
        <span class="text-sm text-slate-600">
          {formatDistanceToNow(createdat, { addSuffix: true })}
        </span>
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
        <ProgressSpinner
          duration={player?.duration ?? 0}
          currentTime={player ? player.duration - player.timeremaining : 0}
        />
        <span class="text-sm text-slate-600">
          {formatTimeRemaining(player.timeremaining ?? 0)}
        </span>
      </div>
    </div>
  {/if}
</a>
