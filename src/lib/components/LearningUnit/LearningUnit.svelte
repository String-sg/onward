<script lang="ts">
  import { Check, Pause, Play, TriangleAlert } from '@lucide/svelte';
  import { formatDistanceToNow } from 'date-fns';
  import type { MouseEventHandler } from 'svelte/elements';

  import { Badge } from '$lib/components/ui/badge/index.js';
  import { Button } from '$lib/components/ui/button/index.js';
  import * as Card from '$lib/components/ui/card/index.js';
  import { getBadgeInfo } from '$lib/helpers/index.js';

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

  const handlePlay: MouseEventHandler<HTMLElement> = (event) => {
    // Prevent default anchor navigation.
    event.preventDefault();

    player?.onplay();
  };

  const handlePause: MouseEventHandler<HTMLElement> = (event) => {
    // Prevent default anchor navigation.
    event.preventDefault();

    player?.onpause();
  };

  const handleResume: MouseEventHandler<HTMLElement> = (event) => {
    // Prevent default anchor navigation.
    event.preventDefault();

    player?.onresume();
  };
</script>

<a href={to} class="group block rounded-3xl focus:outline-none">
  <Card.Root
    class="h-full rounded-3xl transition-shadow group-hover:ring-1 group-hover:ring-slate-200 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-slate-950 group-focus-visible:outline-dashed"
  >
    <Card.Header>
      <div class="mb-2 flex flex-wrap gap-1">
        {#if status}
          <Badge variant={getBadgeInfo(status).variant}>
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

        {#each tags as tag (tag.code)}
          {@const badgeInfo = getBadgeInfo(tag.code)}
          <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
        {/each}
      </div>

      <Card.Title class="line-clamp-2 text-lg font-medium text-slate-950">
        {title}
      </Card.Title>

      <Card.Description class="flex gap-x-1 text-sm text-slate-500">
        <span>{createdby}</span>
        <span>•</span>
        <span>
          {formatDistanceToNow(createdat, { addSuffix: true })}
        </span>
      </Card.Description>
    </Card.Header>

    {#if player}
      <Card.Footer class="pt-0">
        {#if player.isactive && player.isplaying}
          <Button variant="outline" size="lg" onclick={handlePause}>
            <Pause class="h-4 w-4" />
            <span class="font-medium">Pause</span>
          </Button>
        {:else if player.isactive && !player.isplaying}
          <Button variant="outline" size="lg" onclick={handleResume}>
            <Play class="h-4 w-4" />
            <span class="font-medium">Resume</span>
          </Button>
        {:else}
          <Button variant="outline" size="lg" onclick={handlePlay}>
            <Play class="h-4 w-4" />
            <span class="font-medium">Play</span>
          </Button>
        {/if}
      </Card.Footer>
    {/if}
  </Card.Root>
</a>
