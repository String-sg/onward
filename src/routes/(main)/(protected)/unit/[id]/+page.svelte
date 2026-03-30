<script lang="ts">
  import {
    ArrowLeft,
    BookOpenTextIcon,
    Check,
    ExternalLink,
    Headphones,
    Lightbulb,
    MessageCircleWarningIcon,
    Pause,
    ThumbsDown,
    ThumbsUp,
    TriangleAlert,
    Video,
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
  import { Button } from '$lib/components/Button/index.js';
  import { Modal } from '$lib/components/Modal/index.js';
  import { VimeoPlayer } from '$lib/components/VimeoPlayer/index.js';
  import {
    getBadgeInfo,
    HOME_PATH,
    IsWithinViewport,
    track20PercentVideoPlay,
    track50PercentVideoPlay,
    track80PercentVideoPlay,
    trackPodcastPlay,
    trackQuizClick,
    trackSourcesClick,
    trackVideoCompletion,
  } from '$lib/helpers/index.js';
  import { Player } from '$lib/states/index.js';

  const { data } = $props();

  let returnTo = $state(HOME_PATH);
  let target = $state<HTMLElement | null>(null);
  let isSourcesModalOpen = $state(false);
  let sentiment = $derived(data.userSentiment);

  const isWithinViewport = new IsWithinViewport(() => target);
  const player = Player.get();

  let isActive = $derived(
    player.currentTrack !== null && player.currentTrack.id === data.id && player.progress !== 0,
  );

  let videoModalOpen = $state(false);
  const podcastContent = $derived(data.contents.find((c) => c.type === 'PODCAST'));
  const videoContent = $derived(data.contents.find((c) => c.type === 'VIDEO'));

  let podcastCheckpoint = $derived(podcastContent ? (data.checkpoints[podcastContent.id] ?? 0) : 0);
  let videoCheckpoint = $derived(videoContent ? (data.checkpoints[videoContent.id] ?? 0) : 0);

  afterNavigate(({ from, type }) => {
    if (type === 'enter' || !from) {
      return;
    }

    if (from.route.id && page.route.id && from.route.id.startsWith(page.route.id)) {
      returnTo = sessionStorage.getItem('unit_origin') || HOME_PATH;
      return;
    }

    sessionStorage.setItem('unit_origin', from.url.pathname);
    returnTo = from.url.pathname;
  });

  const handleWatch = () => {
    videoModalOpen = true;
    if (player.isPlaying) {
      player.toggle();
    }
  };

  const handleCloseVideo = () => {
    videoModalOpen = false;
  };

  const handlePlay = () => {
    if (!podcastContent || !podcastContent.url) {
      return;
    }
    trackPodcastPlay(data.id);
    player.play({
      id: data.id,
      tags: data.tags,
      title: data.title,
      summary: data.summary,
      url: podcastContent.url,
      learningUnitContentId: podcastContent.id,
    });
    player.isNowPlayingViewOpen = true;
  };

  const handlePause = () => {
    player.toggle();
  };

  const handleResume = () => {
    trackPodcastPlay(data.id);

    if (!isActive) {
      const initialSeekTime = podcastCheckpoint;
      player.play(
        {
          id: data.id,
          tags: data.tags,
          title: data.title,
          summary: data.summary,
          url: podcastContent ? (podcastContent.url ?? '') : '',
          learningUnitContentId: podcastContent ? podcastContent.id : undefined,
        },
        initialSeekTime,
      );
    } else {
      player.toggle();
    }
    player.isNowPlayingViewOpen = true;
  };

  let tracked20 = false;
  let tracked50 = false;
  let tracked80 = false;
  let tracked100 = false;

  const handleVideoTimeUpdate = (percent: number) => {
    if (percent >= 20 && !tracked20) {
      tracked20 = true;
      track20PercentVideoPlay(data.id);
    }
    if (percent >= 50 && !tracked50) {
      tracked50 = true;
      track50PercentVideoPlay(data.id);
    }
    if (percent >= 80 && !tracked80) {
      tracked80 = true;
      track80PercentVideoPlay(data.id);
    }
    if (percent >= 100 && !tracked100) {
      tracked100 = true;
      handleVideoComplete();
    }
  };

  const handleVideoEnded = () => {
    if (!tracked100) {
      tracked100 = true;
      handleVideoComplete();
    }
  };

  const handleVideoComplete = () => {
    if (!videoContent) {
      return;
    }
    fetch('/api/learningjourney', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: data.id,
        lastCheckpoint: 0,
        learningUnitContentId: videoContent.id,
        csrfToken: data.csrfToken,
        isCompleted: !data.isQuizAvailable,
      }),
    });
    trackVideoCompletion(data.id);
  };

  const handleVideoCheckpoint = (currentTime: number) => {
    if (!videoContent) {
      return;
    }
    fetch('/api/learningjourney', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: data.id,
        lastCheckpoint: currentTime,
        learningUnitContentId: videoContent.id,
        csrfToken: data.csrfToken,
      }),
    });
  };

  const handleSourcesModal = () => {
    isSourcesModalOpen = true;
    trackSourcesClick(data.id);
  };

  const toggleSourcesModal = () => {
    isSourcesModalOpen = !isSourcesModalOpen;
  };

  const handleQuizClick = () => {
    trackQuizClick(data.id);
  };
</script>

<header class="fixed inset-x-0 z-50 bg-white/90 backdrop-blur-sm">
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
      {
        AI: 'bg-pink-50',
        BOB: 'bg-blue-50',
        CAREER: 'bg-violet-50',
        EDU_VOICES: 'bg-cyan-50',
        EMP_ENGAGEMENT: 'bg-blue-50',
        INFRA: 'bg-blue-50',
        INNOV: 'bg-pink-50',
        NEWS: 'bg-cyan-50',
        PROD: 'bg-orange-50',
        STU_DEV: 'bg-green-50',
        WELLBEING: 'bg-emerald-50',
      }[data.tags[0]?.code],
    ]}
  >
    <div class="flex flex-wrap gap-x-2">
      {#if data.quizStatus}
        <div>
          <Badge variant={getBadgeInfo(data.quizStatus).variant}>
            {#if data.quizStatus === 'OVERDUE'}
              <div class="flex items-center gap-x-1">
                <TriangleAlert class="h-3 w-3 text-orange-500" strokeWidth={3} />
                <span>Overdue</span>
              </div>
            {:else if data.quizStatus === 'COMPLETED'}
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
        </div>
      {/if}

      {#if data.tags[0]}
        {@const badgeInfo = getBadgeInfo(data.tags[0].code)}
        <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
      {/if}
    </div>

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
        {#if podcastContent}
          {#if isActive && player.isPlaying}
            <Button variant="primary" width="full" onclick={handlePause}>
              <Pause class="h-4 w-4" />
              <span class="font-medium">Pause</span>
            </Button>
          {:else if isActive && !player.isPlaying}
            <Button variant="primary" width="full" onclick={handleResume}>
              <Headphones class="h-4 w-4" />
              <span class="font-medium">Listen</span>
            </Button>
          {:else if podcastCheckpoint > 0}
            <Button variant="primary" width="full" onclick={handleResume}>
              <Headphones class="h-4 w-4" />
              <span class="font-medium">Listen</span>
            </Button>
          {:else}
            <Button variant="primary" width="full" onclick={handlePlay}>
              <Headphones class="h-4 w-4" />
              <span class="font-medium">Listen</span>
            </Button>
          {/if}
        {/if}

        {#if videoContent}
          <Button variant="secondary" width="full" onclick={handleWatch}>
            <Video class="h-4 w-4" />
            <span class="font-medium">Watch</span>
          </Button>
        {/if}

        {#if data.isQuizAvailable}
          {#if podcastContent && videoContent}
            <div role="separator" class="h-px shrink-0 bg-slate-200"></div>
          {/if}
          <form method="POST" action="?/updateQuizAttempt" use:enhance>
            <input type="hidden" name="csrfToken" value={data.csrfToken} />

            <Button
              variant="secondary"
              width="full"
              disabled={data.aiLiteracyCompleted !== null && !data.aiLiteracyCompleted}
              onclick={handleQuizClick}
            >
              <Lightbulb class="h-4 w-4" />
              <span class="font-medium">Take the quiz</span>
            </Button>
          </form>
        {/if}
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-y-6">
    {#if data.isRequired && data.dueDate && data.quizStatus !== 'COMPLETED'}
      <div class="flex items-start gap-x-2 rounded-lg bg-slate-100 p-2.5">
        <MessageCircleWarningIcon class="shrink-0" />
        This bite is mandatory and is due on {new Date(data.dueDate).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}.
      </div>
    {/if}

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

<Modal isopen={isSourcesModalOpen} onclose={toggleSourcesModal} size="partial">
  <header class="sticky inset-x-0 top-0 bg-white/90 backdrop-blur-sm">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <span class="text-xl font-medium">Sources</span>

      <button
        onclick={toggleSourcesModal}
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
              {@const badgeInfo = getBadgeInfo(tag.code)}
              <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
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

{#if videoContent}
  <Modal
    isopen={videoModalOpen}
    onclose={handleCloseVideo}
    variant="dark"
    class="pointer-events-none"
    closeonbackdropclick={false}
  />

  <div
    class={[
      'fixed inset-0 z-202 flex items-center justify-center transition-opacity duration-300',
      videoModalOpen
        ? 'pointer-events-auto mx-auto max-w-5xl opacity-100'
        : 'pointer-events-none opacity-0',
    ]}
  >
    <button
      onclick={handleCloseVideo}
      class="absolute top-4 right-4 z-10 cursor-pointer rounded-full p-3 text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed"
    >
      <X />
    </button>

    <div class="w-full px-4 landscape:max-w-[calc((100svh-2rem)*16/9)]">
      <VimeoPlayer
        url={videoContent.url ?? ''}
        startTime={videoCheckpoint || undefined}
        active={videoModalOpen}
        ontimeupdate={handleVideoTimeUpdate}
        onended={handleVideoEnded}
        oncheckpoint={handleVideoCheckpoint}
        onpause={handleVideoCheckpoint}
      />
    </div>
  </div>
{/if}
