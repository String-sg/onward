<script lang="ts">
  import Play from '@lucide/svelte/icons/play';
  import type { MouseEventHandler } from 'svelte/elements';

  import { Badge, type BadgeProps } from '$lib/components/Badge/index.js';
  import { Button } from '$lib/components/Button/index.js';

  interface Props {
    /**
     * The URL to navigate to when the user clicks on the MLU.
     */
    to: string;
    /**
     * The tags to display on the MLU.
     */
    tags: { variant: BadgeProps['variant']; content: string }[];
    /**
     * The title of the MLU.
     */
    title: string;
    /**
     * A callback function that is called when the user clicks on the play button.
     */
    onplay?: MouseEventHandler<HTMLButtonElement>;
    /**
     * A flag to display the panel containing the Play button and progress indicator.
     */
    showplayerpanel?: boolean;
  }

  let { to, title, tags, onplay, showplayerpanel = false }: Props = $props();

  const handlePlay: MouseEventHandler<HTMLButtonElement> = (event) => {
    // Prevent the default behavior of the anchor tag from navigating to the URL.
    event.preventDefault();

    onplay?.(event);
  };
</script>

<a href={to} class="shadow-xs flex flex-col gap-y-6 rounded-3xl bg-white p-6">
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
        <span class="text-sm text-slate-600">Guidance Branch</span>
        <span class="text-sm text-slate-600">•</span>
        <span class="text-sm text-slate-600">2 days ago</span>
      </div>
    </div>
  </div>

  {#if showplayerpanel}
    <div class="flex items-center gap-x-3">
      <Button variant="secondary" onclick={handlePlay}>
        <Play class="h-4 w-4" />
        <span class="font-medium">Play</span>
      </Button>

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
