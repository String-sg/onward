<script lang="ts">
  import { Pause, Play, RotateCcw, RotateCw, X } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import type { EventHandler, MouseEventHandler } from 'svelte/elements';

  import { Badge } from '$lib/components/Badge/index.js';
  import { Modal, type ModalProps } from '$lib/components/Modal/index.js';
  import { Slider, type SliderProps } from '$lib/components/Slider/index.js';
  import { formatTime, getBadgeInfo } from '$lib/helpers/index.js';

  const PLAYBACK_SPEED_OPTIONS = [0.5, 1.0, 1.5, 2.0];
  const SKIP_SECONDS = 15;

  interface Props {
    src: string;
    title: string;
    tags: { code: string; label: string }[];
    startTime?: number;
    isopen: ModalProps['isopen'];
    onclose: ModalProps['onclose'];
    ontimeupdate?: (currentTime: number, duration: number) => void;
    onended?: () => void;
    onpause?: (currentTime: number) => void;
  }

  const { src, title, tags, startTime, isopen, onclose, ontimeupdate, onended, onpause }: Props =
    $props();

  let video: HTMLVideoElement | null = $state(null);
  let playing = $state(false);
  let currentTime = $state(0);
  let duration = $state(0);
  let playbackSpeedIndex = $state(1);
  let isControlGroupVisible = $state(true);

  let controlGroupTimeout: ReturnType<typeof setTimeout> | null = null;

  const playbackSpeed = $derived(PLAYBACK_SPEED_OPTIONS[playbackSpeedIndex]);

  onMount(() => {
    return () => {
      if (controlGroupTimeout) {
        clearTimeout(controlGroupTimeout);
      }
    };
  });

  const handleTogglePlayPause = () => {
    if (!video) {
      return;
    }
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSkipBack = () => {
    if (!video) {
      return;
    }
    video.currentTime = Math.max(0, video.currentTime - SKIP_SECONDS);
  };

  const handleSkipForward = () => {
    if (!video) {
      return;
    }
    video.currentTime = Math.min(video.duration, video.currentTime + SKIP_SECONDS);
  };

  const handleCycleSpeed = () => {
    playbackSpeedIndex = (playbackSpeedIndex + 1) % PLAYBACK_SPEED_OPTIONS.length;
    if (video) {
      video.playbackRate = PLAYBACK_SPEED_OPTIONS[playbackSpeedIndex];
    }
  };

  const handleSeek: SliderProps['onvaluechange'] = (value) => {
    if (!video) {
      return;
    }
    video.currentTime = value;
  };

  const handleLoadedMetadata: EventHandler<Event, HTMLVideoElement> = async () => {
    if (!video) {
      return;
    }
    duration = video.duration;

    // Seek to checkpoint then auto-play for first load.
    if (startTime && startTime > 0) {
      video.currentTime = startTime;
    }

    try {
      await video.play();
    } catch (err) {
      console.error({ err }, 'Failed to play the video');
    }
  };

  const handleTimeUpdate: EventHandler<Event, HTMLVideoElement> = () => {
    if (!video) {
      return;
    }
    currentTime = video.currentTime;
    if (ontimeupdate) {
      ontimeupdate(currentTime, duration);
    }
  };

  const handlePlay: EventHandler<Event, HTMLVideoElement> = () => {
    playing = true;
    handleShowControls();
  };

  const handlePause: EventHandler<Event, HTMLVideoElement> = () => {
    playing = false;
    isControlGroupVisible = true;
    if (controlGroupTimeout) {
      clearTimeout(controlGroupTimeout);
    }
    if (video && onpause) {
      onpause(video.currentTime);
    }
  };

  const handleEnded: EventHandler<Event, HTMLVideoElement> = () => {
    playing = false;
    currentTime = 0;
    if (video) {
      video.currentTime = 0;
    }
    isControlGroupVisible = true;
    if (controlGroupTimeout) {
      clearTimeout(controlGroupTimeout);
      controlGroupTimeout = null;
    }
    if (onended) {
      onended();
    }
  };

  const handleShowControls = () => {
    isControlGroupVisible = true;
    if (controlGroupTimeout) {
      clearTimeout(controlGroupTimeout);
    }
    if (playing) {
      controlGroupTimeout = setTimeout(() => {
        isControlGroupVisible = false;
      }, 3000);
    }
  };

  const handleOverlayClick: MouseEventHandler<HTMLDivElement> = () => {
    if (isControlGroupVisible) {
      handleTogglePlayPause();
    }
    handleShowControls();
  };

  const handleClose: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    if (video && !video.paused) {
      video.pause();
    }
    onclose();
  };
</script>

<Modal {isopen} {onclose} variant="dark">
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="relative mx-auto flex h-svh max-w-5xl flex-col landscape:justify-center landscape:py-0"
    onclick={handleOverlayClick}
    onkeydown={(e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleTogglePlayPause();
      }
    }}
    onpointerenter={handleShowControls}
    onpointermove={handleShowControls}
    aria-label="Video player"
    role="region"
  >
    <!-- Close button row (in flow on portrait + desktop, absolute on mobile landscape) -->
    <div
      class="flex justify-end p-2 landscape:absolute landscape:top-0 landscape:right-0 landscape:z-10 landscape:p-0 lg:landscape:relative lg:landscape:p-2"
    >
      <button
        aria-label="Close video"
        onclick={handleClose}
        class="cursor-pointer rounded-full p-2 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed landscape:p-3 lg:landscape:p-2"
      >
        <X />
      </button>
    </div>

    <!-- svelte-ignore a11y_media_has_caption -->
    <!-- Video -->
    <video
      bind:this={video}
      {src}
      playsinline
      data-testid="video-player"
      class="min-h-0 flex-1 rounded-lg object-contain portrait:my-auto landscape:h-full landscape:w-full landscape:rounded-none lg:landscape:h-auto lg:landscape:flex-initial"
      onloadedmetadata={handleLoadedMetadata}
      ontimeupdate={handleTimeUpdate}
      onplay={handlePlay}
      onpause={handlePause}
      onended={handleEnded}
    ></video>

    <!-- Badge and Title -->
    <div
      class="flex flex-col gap-y-2 px-4 pt-3 landscape:hidden lg:landscape:flex"
      role="presentation"
      onclick={(e) => e.stopPropagation()}
    >
      {#each tags as tag (tag.code)}
        {@const badgeInfo = getBadgeInfo(tag.code)}
        <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
      {/each}

      <span class="text-lg font-medium">{title}</span>
    </div>

    <!-- Controls -->
    <div
      class={[
        'flex flex-col gap-y-3 portrait:px-4 portrait:py-3 landscape:absolute landscape:inset-x-0 landscape:bottom-0 landscape:gap-y-1.5 landscape:bg-gradient-to-t landscape:from-black/60 landscape:to-transparent landscape:px-4 landscape:pt-4 landscape:pb-3 landscape:transition-opacity landscape:duration-300 lg:landscape:relative lg:landscape:inset-auto lg:landscape:gap-y-3 lg:landscape:bg-none lg:landscape:pt-0 lg:landscape:pb-3 lg:landscape:transition-none',
        !isControlGroupVisible &&
          'landscape:pointer-events-none landscape:opacity-0 lg:landscape:pointer-events-auto lg:landscape:opacity-100',
      ]}
      role="presentation"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
    >
      <!-- Slider and Timestamp -->
      <div class="flex flex-col gap-y-2">
        <Slider min={0} max={duration} step={1} value={currentTime} onvaluechange={handleSeek} />

        <div class="flex justify-between">
          <span class="text-sm tabular-nums">{formatTime(currentTime)}</span>
          <span class="text-sm tabular-nums">-{formatTime(duration - currentTime)}</span>
        </div>
      </div>

      <!-- Speed Control (portrait) -->
      <div class="flex justify-center landscape:hidden lg:landscape:flex">
        <button
          onclick={handleCycleSpeed}
          aria-label="Playback speed"
          class="flex cursor-pointer items-center rounded-full bg-white/20 px-4 py-2 transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed"
        >
          <span class="text-sm font-medium text-white">{playbackSpeed.toFixed(1)}x speed</span>
        </button>
      </div>

      <!-- Playback Controls -->
      <div class="relative flex items-center justify-evenly py-2 landscape:py-0 lg:landscape:py-2">
        <button
          aria-label="Skip back"
          onclick={handleSkipBack}
          class="cursor-pointer rounded-full p-2 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed sm:p-3"
        >
          <RotateCcw />
        </button>

        <button
          aria-label={playing ? 'Pause' : 'Play'}
          onclick={handleTogglePlayPause}
          class="cursor-pointer rounded-full bg-white p-3 text-black transition-colors hover:bg-white/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed sm:p-4"
        >
          {#if playing}
            <Pause />
          {:else}
            <Play />
          {/if}
        </button>

        <button
          aria-label="Skip forward"
          onclick={handleSkipForward}
          class="cursor-pointer rounded-full p-2 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed sm:p-3"
        >
          <RotateCw />
        </button>

        <!-- Speed button inline in landscape — positioned absolutely so it doesn't shift playback buttons -->
        <button
          onclick={handleCycleSpeed}
          aria-label="Playback speed"
          class="absolute right-0 hidden cursor-pointer items-center rounded-full bg-white/20 px-3 py-1.5 transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed landscape:flex lg:landscape:hidden"
        >
          <span class="text-sm font-medium text-white">{playbackSpeed.toFixed(1)}x</span>
        </button>
      </div>
    </div>
  </div>
</Modal>
