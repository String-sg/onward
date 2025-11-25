<script lang="ts">
  import { Check, Pause, Play, TriangleAlert } from '@lucide/svelte';
  import { formatDistanceToNow } from 'date-fns';
  import type { MouseEventHandler } from 'svelte/elements';

  import { Badge } from '$lib/components/Badge/index.js';
  import { Button } from '$lib/components/Button/index.js';
  import { tagCodeToBadgeVariant } from '$lib/helpers/index.js';

  export interface Props {
    /**
     * The URL to navigate to when clicking the card.
     */
    to: string;
    /**
     * The tags to display on the card.
     */
    tags: { code: string; label: string }[];
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
     * The status for required learning unit.
     */
    status: 'REQUIRED' | 'COMPLETED' | 'OVERDUE' | null;
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

  let { to, title, tags, createdat, createdby, status, player = null }: Props = $props();

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
  class="flex flex-col gap-y-6 rounded-3xl border border-slate-200 bg-white p-5.75 transition-shadow hover:ring-1 hover:ring-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
>
  <div class="flex flex-col gap-y-1">
    <div class="flex flex-wrap gap-1">
      {#if status}
        <Badge variant={tagCodeToBadgeVariant(status)}>
          {#if status === 'OVERDUE'}
            <div class="flex items-center gap-x-1">
              <TriangleAlert class="h-3 w-3 text-orange-500" strokeWidth={3} />
              <span>Overdue</span>
            </div>
          {:else if status === 'COMPLETED'}
            <div class="flex items-center gap-x-1">
              <Check class="h-3 w-3 text-lime-600" strokeWidth={4} />
              <span>Completed</span>
            </div>
          {:else}
            <div class="flex items-center gap-x-1">
              <Check class="h-3 w-3 text-slate-600" strokeWidth={4} />
              <span>Required</span>
            </div>
          {/if}
        </Badge>
      {/if}

      {#each tags as tag (tag.label)}
        <Badge variant={tagCodeToBadgeVariant(tag.code)}>{tag.label}</Badge>
      {/each}
    </div>

    <div class="flex flex-col gap-y-3">
      <span class="line-clamp-2 text-lg font-medium text-slate-950">
        {title}
      </span>

      <div class="flex gap-x-1">
        <span class="text-sm text-slate-500">{createdby}</span>
        <span class="text-sm text-slate-500">•</span>
        <span class="text-sm text-slate-500">
          {formatDistanceToNow(createdat, { addSuffix: true })}
        </span>
      </div>
    </div>
  </div>

  {#if player}
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
  {/if}
</a>
