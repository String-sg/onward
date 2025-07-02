<script lang="ts">
  import { ArrowLeft, Lightbulb, Play, Share } from '@lucide/svelte';
  import { formatDistanceToNow } from 'date-fns';

  import Badge from '$lib/components/Badge.svelte';

  const { data } = $props();
</script>

<div class="flex flex-col gap-y-6 p-6">
  <div class="flex justify-between">
    <div class="rounded-full bg-slate-200 px-3 py-4">
      <ArrowLeft />
    </div>

    <button
      class="cursor-pointer rounded-full bg-slate-200 px-3 py-4 transition-colors hover:bg-slate-300"
    >
      <Share />
    </button>
  </div>

  <div class="flex flex-col gap-y-2 rounded-3xl bg-white p-4">
    <div class="flex flex-wrap gap-1">
      {#each data.tags as tag (tag)}
        <Badge variant="purple">{tag}</Badge>
      {/each}
    </div>

    <div class="flex flex-col gap-y-6">
      <div class="flex flex-col gap-y-3">
        <span class="text-xl font-medium text-slate-950">
          {data.title}
        </span>

        <div class="flex gap-x-1">
          <span class="text-sm text-slate-600">By Guidance Branch</span>
          <span class="text-sm text-slate-600">•</span>
          <span class="text-sm text-slate-600">
            {formatDistanceToNow(data.createdAt, { addSuffix: true })}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-y-4">
        <button
          class="py-2.75 flex cursor-pointer items-center justify-center gap-x-1 rounded-full border border-transparent bg-slate-950 px-4 text-white transition-colors hover:bg-slate-900/90 disabled:pointer-events-none disabled:opacity-50"
        >
          <Play class="h-4 w-4" />
          <span class="font-medium">Play</span>
        </button>

        <a
          href={`/content/${data.id}/quiz`}
          class="py-2.75 flex cursor-pointer items-center justify-center gap-x-1 rounded-full border border-slate-300 bg-white px-4 text-slate-950 transition-colors hover:bg-slate-100"
        >
          <Lightbulb class="h-4 w-4" />
          <span class="font-medium">Take the quiz</span>
        </a>
      </div>
    </div>
  </div>
</div>
