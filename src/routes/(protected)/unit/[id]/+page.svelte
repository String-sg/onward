<script lang="ts">
  import {
    ArrowLeft,
    BookOpenTextIcon,
    ExternalLink,
    Lightbulb,
    MessageCircleWarningIcon,
    Pause,
    Play,
    ThumbsDown,
    ThumbsUp,
    X,
  } from '@lucide/svelte';
  import { formatDistanceToNow } from 'date-fns';
  import DOMPurify from 'dompurify';
  import { marked } from 'marked';

  import { browser } from '$app/environment';
  import { enhance } from '$app/forms';
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { Badge } from '$lib/components/Badge/index.js';
  import { Button, LinkButton } from '$lib/components/Button/index.js';
  import { Modal } from '$lib/components/Modal/index.js';
  import {
    IsWithinViewport,
    tagCodeToBadgeVariant,
    trackPodcastPlay,
    trackQuizClick,
  } from '$lib/helpers/index.js';
  import { Player } from '$lib/states/index.js';

  const { data } = $props();

  let returnTo = $state('/');
  let target = $state<HTMLElement | null>(null);
  let isSourcesModalOpen = $state(false);
  let sentiment = $derived(data.userSentiment);

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

  const handlePlay = () => {
    trackPodcastPlay(data.id.toString());

    player.play({
      id: data.id,
      tags: data.tags,
      title: data.title,
      summary: data.summary,
      url: data.url,
      type: data.collectionType,
    });
  };

  const handlePause = () => {
    player.toggle();
  };

  const handleResume = () => {
    trackPodcastPlay(data.id.toString());

    if (!isActive) {
      const initialSeekTime = lastCheckpoint;
      player.play(
        {
          id: data.id,
          tags: data.tags,
          title: data.title,
          summary: data.summary,
          url: data.url,
          type: data.collectionType,
        },
        initialSeekTime,
      );

      lastCheckpoint = 0;
    } else {
      player.toggle();
    }
  };

  const handleSourcesModal = () => {
    isSourcesModalOpen = true;
  };

  const toggleSourcesModalVisibility = () => {
    isSourcesModalOpen = !isSourcesModalOpen;
  };

  const handleQuizClick = () => {
    trackQuizClick(data.id.toString());
  };
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-sm">
  <div
    class={[
      'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
      !isWithinViewport.current && '!bg-slate-950/7.5',
    ]}
  ></div>

  <div class="mx-auto flex max-w-5xl px-4 py-3">
    <a
      href={returnTo}
      class="rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
    >
      <ArrowLeft />
    </a>
  </div>
</header>

<div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-5 px-4 pt-23 pb-28">
  <div
    class={[
      'flex flex-col gap-y-2 rounded-3xl border border-slate-200 p-6',
      data.collectionType === 'BOB' && 'bg-blue-50',
      data.collectionType === 'AI' && 'bg-cyan-50',
      data.collectionType === 'NEWS' && 'bg-orange-50',
      data.collectionType === 'PROD' && 'bg-emerald-50',
      data.collectionType === 'CAREER' && 'bg-violet-50',
      data.collectionType === 'INNOV' && 'bg-pink-50',
      data.collectionType === 'WELLBEING' && 'bg-teal-50',
      data.collectionType === 'STU_WELL' && 'bg-sky-50',
      data.collectionType === 'STU_DEV' && 'bg-green-50',
    ]}
  >
    {#if data.collectionType === 'BOB'}
      <Badge variant="blue">Learn with BOB</Badge>
    {:else if data.collectionType === 'AI'}
      <Badge variant="cyan">Artificial Intelligence</Badge>
    {:else if data.collectionType === 'NEWS'}
      <Badge variant="orange">In the news</Badge>
    {:else if data.collectionType === 'PROD'}
      <Badge variant="emerald">Productivity</Badge>
    {:else if data.collectionType === 'CAREER'}
      <Badge variant="violet">Career growth</Badge>
    {:else if data.collectionType === 'INNOV'}
      <Badge variant="pink">Innovation</Badge>
    {:else if data.collectionType === 'WELLBEING'}
      <Badge variant="teal">Wellbeing</Badge>
    {:else if data.collectionType === 'STU_WELL'}
      <Badge variant="sky">Student wellbeing</Badge>
    {:else if data.collectionType === 'STU_DEV'}
      <Badge variant="green">Student development</Badge>
    {/if}

    <div class="flex flex-col gap-y-6">
      <div class="flex flex-col gap-y-2">
        <span class="text-lg font-medium">
          {data.title}
        </span>

        <div class="flex flex-wrap gap-x-1.5">
          <span class="text-slate-500">By {data.createdBy}</span>
          <span class="text-slate-500">•</span>
          <span class="text-slate-500">
            {formatDistanceToNow(data.createdAt, { addSuffix: true })}
          </span>
        </div>
      </div>

      <div class="flex gap-x-2">
        <form method="POST" action="?/updateSentiment" use:enhance>
          <input type="hidden" name="csrfToken" value={data.csrfToken} />
          <input type="hidden" name="hasLiked" value={sentiment === true ? null : 'true'} />

          <button
            type="submit"
            class={[
              'flex cursor-pointer items-center justify-center gap-x-2.5 rounded-full bg-white p-3 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed',
              sentiment === true && '!bg-slate-950 px-4 py-2.5 text-white',
            ]}
          >
            <ThumbsUp class="h-4 w-4" />

            {#if data.likesCount > 0}
              <span class="text-sm font-medium">{data.likesCount}</span>
            {/if}
          </button>
        </form>

        <form method="POST" action="?/updateSentiment" use:enhance>
          <input type="hidden" name="csrfToken" value={data.csrfToken} />
          <input type="hidden" name="hasLiked" value={sentiment === false ? null : 'false'} />

          <button
            type="submit"
            class={[
              'flex cursor-pointer items-center justify-center gap-x-2.5 rounded-full bg-white p-3 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed',
              sentiment === false && '!bg-slate-950 text-white',
            ]}
          >
            <ThumbsDown class="h-4 w-4" />
          </button>
        </form>
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
          onclick={handleQuizClick}
        >
          <Lightbulb class="h-4 w-4" />
          <span class="font-medium">Take the quiz</span>
        </LinkButton>
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-y-6">
    <div class="flex flex-col gap-y-2 rounded-lg bg-slate-100 p-2.5">
      <MessageCircleWarningIcon></MessageCircleWarningIcon>
      This bite is mandatory and is due on 30 <br class="sm:hidden" /> September 2025.
    </div>
    <div class={['prose prose-slate max-w-none text-lg']}>
      {#if browser}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html DOMPurify.sanitize(marked.parse(data.objectives, { async: false }))}
      {/if}
    </div>

    <div class="flex gap-x-6">
      <button
        class="inline-flex cursor-pointer items-center justify-center gap-x-2.5 rounded-full bg-slate-200 px-4 py-3 transition-colors hover:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
        onclick={handleSourcesModal}
      >
        <BookOpenTextIcon />
        <span class="text-sm font-medium">Sources</span>
      </button>
    </div>
  </div>
</main>

<Modal isopen={isSourcesModalOpen} onclose={toggleSourcesModalVisibility} size="partial">
  <header class="sticky inset-x-0 top-0 bg-white/90 backdrop-blur-sm">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <span class="text-xl font-medium">Sources</span>

      <button
        onclick={toggleSourcesModalVisibility}
        class="cursor-pointer rounded-full p-3 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
      >
        <X />
      </button>
    </div>
  </header>

  <main class="mx-auto flex min-h-[calc(100%-72px)] max-w-5xl flex-col gap-y-10 px-4 py-3">
    {#if data.learningUnitSources.length === 0}
      <span class="flex justify-center text-sm">No references available for this podcast</span>
    {/if}

    <div class="flex flex-col gap-y-4">
      {#each data.learningUnitSources as source (source)}
        <a
          href={source.sourceURL}
          target="_blank"
          class="inline-flex gap-x-4 rounded-2xl border border-slate-200 bg-white p-3"
        >
          <div class="flex w-[calc(100%-36px)] flex-col gap-y-1">
            {#each source.tags.map((t) => t.tag) as tag (tag)}
              <Badge variant={tagCodeToBadgeVariant(tag.code)}>{tag.label}</Badge>
            {/each}

            <span class="truncate">
              {source.title}
            </span>
          </div>

          <div class="flex items-center justify-center">
            <ExternalLink class="h-5 w-5" />
          </div>
        </a>
      {/each}
    </div>
  </main>
</Modal>
