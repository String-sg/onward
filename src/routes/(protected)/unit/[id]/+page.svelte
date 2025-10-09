<script lang="ts">
  import { ArrowLeft, ChevronsDown, Lightbulb, Pause, Play, Share } from '@lucide/svelte';
  import { formatDistanceToNow } from 'date-fns';
  import DOMPurify from 'dompurify';
  import { marked } from 'marked';

  import { browser } from '$app/environment';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { Badge } from '$lib/components/Badge/index.js';
  import { Button, LinkButton } from '$lib/components/Button/index.js';
  import { IsWithinViewport, tagCodeToBadgeVariant } from '$lib/helpers/index.js';
  import { Player } from '$lib/states/index.js';

  const { data } = $props();

  let returnTo = $state('/');
  let isExpanded = $state(false);
  let target = $state<HTMLElement | null>(null);

  const isWithinViewport = new IsWithinViewport(() => target);
  const player = Player.get();

  let isActive = $derived(player.currentTrack?.id === data.id && player.progress !== 0);
  let lastCheckpoint = $state(data.lastCheckpoint);

  afterNavigate(({ from, type }) => {
    if (type === 'enter' || !from) {
      return;
    }

    if (from.route.id && page.route.id && from.route.id.startsWith(page.route.id)) {
      returnTo = sessionStorage.getItem('unit_origin') || '/';
      return;
    }

    sessionStorage.setItem('unit_origin', from.url.pathname);
    returnTo = from.url.pathname;
  });

  const toggleIsExpanded = () => {
    isExpanded = !isExpanded;
  };

  const handlePlay = () => {
    player.play({
      id: data.id,
      tags: data.tags,
      title: data.title,
      url: data.url,
    });
  };

  const handlePause = () => {
    player.toggle();
  };

  const handleResume = () => {
    if (!isActive) {
      const initialSeekTime = lastCheckpoint;
      player.play(
        {
          id: data.id,
          tags: data.tags,
          title: data.title,
          url: data.url,
        },
        initialSeekTime,
      );

      lastCheckpoint = 0;
    } else {
      player.toggle();
    }
  };
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-slate-100/90 backdrop-blur-sm">
  <div
    class={[
      'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
      !isWithinViewport.current && '!bg-slate-950/7.5',
    ]}
  ></div>

  <div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-x-8 px-4 py-3">
    <a
      href={returnTo}
      class="rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
    >
      <ArrowLeft />
    </a>

    <button
      class="cursor-pointer rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
    >
      <Share />
    </button>
  </div>
</header>

<div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-6 px-4 pt-23 pb-28">
  <div class="flex flex-col gap-y-2 rounded-3xl bg-white p-4 shadow-xs">
    <div class="flex flex-wrap gap-1">
      {#each data.tags as tag (tag)}
        <Badge variant={tagCodeToBadgeVariant(tag.code)}>{tag.label}</Badge>
      {/each}
    </div>

    <div class="flex flex-col gap-y-6">
      <div class="flex flex-col gap-y-3">
        <span class="text-xl font-medium text-slate-950">
          {data.title}
        </span>

        <div class="flex gap-x-1">
          <span class="text-sm text-slate-600">By {data.createdBy}</span>
          <span class="text-sm text-slate-600">•</span>
          <span class="text-sm text-slate-600">
            {formatDistanceToNow(data.createdAt, { addSuffix: true })}
          </span>
        </div>
      </div>

      <div class="flex flex-col gap-y-4">
        {#if isActive && player.isPlaying}
          <Button variant="primary" width="full" onclick={handlePause}>
            <Pause class="h-4 w-4" />
            <span class="font-medium">Pause</span>
          </Button>
        {:else if isActive && !player.isPlaying}
          <Button variant="primary" width="full" onclick={handleResume}>
            <Play class="h-4 w-4" />
            <span class="font-medium">Resume</span>
          </Button>
        {:else if lastCheckpoint && lastCheckpoint > 0}
          <Button variant="primary" width="full" onclick={handleResume}>
            <Play class="h-4 w-4" />
            <span class="font-medium">Resume</span>
          </Button>
        {:else}
          <Button variant="primary" width="full" onclick={handlePlay}>
            <Play class="h-4 w-4" />
            <span class="font-medium">Play</span>
          </Button>
        {/if}

        <LinkButton
          variant="secondary"
          width="full"
          disabled={!data.isQuizAvailable}
          href={`/unit/${data.id}/quiz`}
        >
          <Lightbulb class="h-4 w-4" />
          <span class="font-medium">Take the quiz</span>
        </LinkButton>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-y-4">
    <div
      class={[
        'max-h-28 overflow-hidden mask-b-from-10%',
        isExpanded && 'max-h-full mask-b-from-100%',
      ]}
    >
      <p class={['prose prose-slate line-clamp-4 text-lg', isExpanded && 'line-clamp-none']}>
        {#if browser}
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html DOMPurify.sanitize(marked.parse(data.summary, { async: false }))}
        {/if}
      </p>
    </div>

    {#if !isExpanded}
      <button
        class="flex w-fit cursor-pointer items-center gap-x-1 self-center px-4 py-2"
        onclick={toggleIsExpanded}
      >
        <span class="text-sm font-medium">Read more</span>
        <ChevronsDown class="h-4 w-4" />
      </button>
    {/if}
  </div>
</main>
