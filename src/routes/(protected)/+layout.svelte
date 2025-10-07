<script lang="ts">
  import { onMount } from 'svelte';

  import { ChatView } from '$lib/components/ChatView/index.js';
  import { ChatWidget } from '$lib/components/ChatWidget/index.js';
  import { NowPlayingBar } from '$lib/components/NowPlayingBar/index.js';
  import { NowPlayingView } from '$lib/components/NowPlayingView/index.js';
  import { Player } from '$lib/states/index.js';

  const { children } = $props();

  let isNowPlayingViewOpen = $state(false);
  let isChatViewOpen = $state(false);
  let isTrackingSession = $state(false);

  const player = Player.create();

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
    if (isTrackingSession) {
      updateLearningJourney(player.progress);
    }
  };

  const handleEnded = () => {
    if (isTrackingSession) {
      updateLearningJourney(0);
    }
    isTrackingSession = false;
  };

  const handleCheckpoint = () => {
    isTrackingSession = true;
    updateLearningJourney(player.progress);
  };

  onMount(() => {
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
{/if}
<ChatView isopen={isChatViewOpen} onclose={handleChatViewClose} />
