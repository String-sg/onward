<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/state';
  import { Button, LinkButton } from '$lib/components/Button/index.js';
  import { ChatView } from '$lib/components/ChatView/index.js';
  import { ChatWidget } from '$lib/components/ChatWidget/index.js';
  import { Modal } from '$lib/components/Modal/index.js';
  import { NowPlayingBar } from '$lib/components/NowPlayingBar/index.js';
  import { NowPlayingView } from '$lib/components/NowPlayingView/index.js';
  import { noop } from '$lib/helpers/index.js';
  import { Player } from '$lib/states/index.js';

  const { children } = $props();

  const player = Player.create();

  let isNowPlayingViewOpen = $state(false);
  let isChatViewOpen = $state(false);
  let isTrackingSession = $state(false);
  let isPodcastCompletedModalOpen = $state(false);

  const isQuizPage = $derived(page.url.pathname.includes('/quiz'));

  const handleNowPlayingBarClick = () => {
    isNowPlayingViewOpen = true;
  };

  const handleNowPlayingBarPlay = () => {
    player.toggle();
  };

  const handleNowPlayingViewClose = () => {
    isNowPlayingViewOpen = false;
  };

  const handleSeek = (value: number) => {
    player.seek(value);
  };

  const handleSkipBack = () => {
    player.skipBack();
  };

  const handleSkipForward = () => {
    player.skipForward();
  };

  const handleSpeedChange = () => {
    player.cyclePlaybackSpeed();
  };

  const handleChatWidgetClick = () => {
    isChatViewOpen = true;
  };

  const handleChatViewClose = () => {
    isChatViewOpen = false;
  };

  const handlePodcastCompletedModalClose = () => {
    isPodcastCompletedModalOpen = false;
  };

  onMount(() => {
    const updateLearningJourney = async (progress: number) => {
      await fetch('/api/learningjourney', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: Number(player.currentTrack?.id),
          lastCheckpoint: progress,
        }),
      });
    };

    const handlePause = () => {
      if (!isTrackingSession) {
        return;
      }

      updateLearningJourney(player.progress);
    };

    const handleEnded = () => {
      if (isTrackingSession) {
        updateLearningJourney(0);
      }

      isPodcastCompletedModalOpen = true;
      isTrackingSession = false;
    };

    const handleCheckpoint = () => {
      if (!isTrackingSession) {
        isTrackingSession = true;
      }

      updateLearningJourney(player.progress);
    };

    player.addEventListener('pause', handlePause);
    player.addEventListener('ended', handleEnded);
    player.addEventListener('checkpoint', handleCheckpoint);

    return () => {
      player.removeEventListener('pause', handlePause);
      player.removeEventListener('ended', handleEnded);
      player.removeEventListener('checkpoint', handleCheckpoint);
    };
  });
</script>

{@render children()}

{#if !isQuizPage}
  <div class="pointer-events-none fixed inset-x-0 bottom-0 z-100">
    <div class="mx-auto flex max-w-5xl justify-end gap-x-4 px-4 py-3">
      {#if player.currentTrack}
        <NowPlayingBar
          title={player.currentTrack.title}
          isplaying={player.isPlaying}
          onclick={handleNowPlayingBarClick}
          onplay={handleNowPlayingBarPlay}
        />
      {/if}

      <ChatWidget onclick={handleChatWidgetClick} />
    </div>
  </div>
{/if}

{#if player.currentTrack}
  <NowPlayingView
    isopen={isNowPlayingViewOpen}
    onclose={handleNowPlayingViewClose}
    isplaying={player.isPlaying}
    playbackspeed={player.playbackSpeed}
    duration={player.duration}
    progress={player.progress}
    currenttrack={player.currentTrack}
    onplaypause={handleNowPlayingBarPlay}
    onseek={handleSeek}
    onskipback={handleSkipBack}
    onskipforward={handleSkipForward}
    onspeedchange={handleSpeedChange}
  />

  <Modal isopen={isPodcastCompletedModalOpen} onclose={noop} class="z-300">
    <div class="mx-auto flex min-h-svh max-w-5xl flex-col px-4 py-3">
      <div class="flex flex-1 flex-col items-center justify-center">
        <enhanced:img
          src="$lib/assets/flagplanet.png?w=768"
          alt="flagplanet"
          sizes="384px"
          class="h-full w-full object-contain"
        />
      </div>

      <div class="flex flex-col gap-y-12">
        <div class="flex flex-col gap-y-4 text-center">
          <span class="text-xl font-medium">Just completed learning!</span>

          <div class="flex flex-col items-center gap-y-2">
            <span>And you are almost there.</span>
            <span>Deepen your understanding by taking a </span>
            <span>quiz and earn one more completion status.</span>
          </div>
        </div>

        <div class="flex justify-center gap-4">
          <Button variant="secondary" onclick={handlePodcastCompletedModalClose}>Close</Button>
          <LinkButton
            href={`/unit/${player.currentTrack.id}/quiz`}
            class="flex-1"
            width="full"
            onclick={handlePodcastCompletedModalClose}
          >
            Take quiz
          </LinkButton>
        </div>
      </div>
    </div>
  </Modal>
{/if}

<ChatView isopen={isChatViewOpen} onclose={handleChatViewClose} />
