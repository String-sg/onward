<script lang="ts">
  import { ArrowLeft, Lightbulb, Play, Share } from '@lucide/svelte';
  import { formatDistanceToNow } from 'date-fns';

  import { afterNavigate } from '$app/navigation';
  import Badge from '$lib/components/Badge.svelte';
  import Button from '$lib/components/Button.svelte';

  const { data } = $props();

  let returnTo = $state('/');

  afterNavigate(({ from, type }) => {
    if (type === 'enter' || !from) {
      returnTo = '/';
      return;
    }

    returnTo = from.url.pathname;
  });
</script>

<div class="flex flex-col gap-y-6 p-6">
  <div class="flex justify-between">
    <a href={returnTo} class="rounded-full bg-slate-200 px-3 py-4">
      <ArrowLeft />
    </a>

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
        <Button size="md">
          <Play class="h-4 w-4" />
          <span class="font-medium">Play</span>
        </Button>

        <Button href={`/content/${data.id}/quiz`} variant="secondary" size="md">
          <Lightbulb class="h-4 w-4" />
          <span class="font-medium">Take the quiz</span>
        </Button>
      </div>
    </div>
  </div>
</div>
