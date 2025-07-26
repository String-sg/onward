<script lang="ts">
  import { ArrowLeft, ChevronsDown, Lightbulb, Play, Share } from '@lucide/svelte';
  import { formatDistanceToNow } from 'date-fns';

  import { afterNavigate } from '$app/navigation';
  import { Badge } from '$lib/components/Badge/index.js';
  import { Button } from '$lib/components/Button/index.js';
  import { IsWithinViewport } from '$lib/helpers/index.js';

  const { data } = $props();

  let returnTo = $state('/');
  let isExpanded = $state(false);
  let target = $state<HTMLElement | null>(null);

  const isWithinViewport = new IsWithinViewport(() => target);

  afterNavigate(({ from, type }) => {
    if (type === 'enter' || !from) {
      returnTo = '/';
      return;
    }

    returnTo = from.url.pathname;
  });

  const toggleIsExpanded = () => {
    isExpanded = !isExpanded;
  };
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-slate-100/90 backdrop-blur-sm">
  <div
    class={[
      'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
      target && !isWithinViewport.current && '!bg-slate-950/7.5',
    ]}
  ></div>

  <div class="mx-auto w-full max-w-5xl px-4 py-3">
    <div class="flex items-center justify-between gap-x-8">
      <a href={returnTo} class="rounded-full p-4 transition-colors hover:bg-slate-200">
        <ArrowLeft />
      </a>

      <button class="cursor-pointer rounded-full p-4 transition-colors hover:bg-slate-200">
        <Share />
      </button>
    </div>
  </div>
</header>

<main class="pt-23 relative mx-auto min-h-full w-full max-w-5xl px-4 pb-3">
  <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

  <div class="flex flex-col gap-y-6">
    <div class="shadow-xs flex flex-col gap-y-2 rounded-3xl bg-white p-4">
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

    <div class="flex flex-col items-center gap-y-4">
      <div
        class={[
          'mask-b-from-10% max-h-28 overflow-hidden',
          isExpanded && 'mask-b-from-100% max-h-full',
        ]}
      >
        <p class={['line-clamp-4 text-lg', isExpanded && 'line-clamp-none']}>
          {data.summary}
        </p>
      </div>

      {#if !isExpanded}
        <button
          class="flex w-fit cursor-pointer items-center gap-x-1 px-4 py-2"
          onclick={toggleIsExpanded}
        >
          <span class="text-sm font-medium">Read more</span>
          <ChevronsDown class="h-4 w-4" />
        </button>
      {/if}
    </div>
  </div>
</main>
