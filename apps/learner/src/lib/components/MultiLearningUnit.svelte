<script lang="ts">
  import { Play } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  import Badge, { type Variant as BadgeVariant } from '$lib/components/Badge.svelte';

  interface Props {
    /**
     * The URL to navigate to when the user clicks on the MLU.
     */
    to: string;
    /**
     * The tags to display on the MLU.
     */
    tags: { variant: BadgeVariant; content: string }[];
    /**
     * The title of the MLU.
     */
    title: string;
    /**
     * Determines whether the play panel is displayed.
     *
     * @default false
     */
    showplaypanel?: boolean;
    /**
     * A callback function that is called when the user clicks on the play button.
     */
    onplay?: MouseEventHandler<HTMLButtonElement>;
  }

  let { to, title, tags, showplaypanel = false, onplay }: Props = $props();

  const handlePlay: MouseEventHandler<HTMLButtonElement> = (event) => {
    // Prevent the default behavior of the anchor tag from navigating to the URL.
    event.preventDefault();

    onplay?.(event);
  };
</script>

<a href={to} class="flex flex-col gap-y-6 rounded-3xl bg-purple-100 p-6">
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

  {#if showplaypanel}
    <div class="flex items-center gap-x-3">
      <button
        class="flex cursor-pointer items-center gap-x-2 rounded-full bg-purple-300 px-6 py-4 transition-colors active:bg-purple-400/75"
        onclick={handlePlay}
      >
        <Play />
        <span class="font-medium text-slate-950">Play</span>
      </button>

      <div class="flex items-center gap-x-2">
        <svg viewBox="0 0 24 24" class="h-6 w-6">
          <circle cx="12" cy="12" r="9" stroke="#D8B4FE" fill="none" stroke-width="3px" />
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="#A855F7"
            fill="none"
            stroke-width="3px"
            stroke-dasharray="56.55"
            stroke-dashoffset="12"
            transform-origin="center"
            transform="rotate(-90 0 0)"
          />
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="#6B21A8"
            fill="none"
            stroke-width="3px"
            stroke-dasharray="56.55"
            stroke-dashoffset="25"
            transform-origin="center"
            transform="rotate(-90 0 0)"
          />
        </svg>

        <span class="text-sm text-slate-600">23m left</span>
      </div>
    </div>
  {/if}
</a>
