<script lang="ts">
  import { Play } from '@lucide/svelte';

  import Badge, { type Variant as BadgeVariant } from '$lib/components/Badge.svelte';

  interface Props {
    tags: { variant: BadgeVariant; content: string }[];
    title: string;
    showplaypanel: boolean;
  }

  let { title, tags, showplaypanel }: Props = $props();
</script>

<div class="flex flex-col gap-y-6 rounded-3xl bg-purple-100 p-6">
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
</div>
