<script lang="ts">
  import { ChatView } from '$lib/components/ChatView/index.js';
  import { ChatWidget } from '$lib/components/ChatWidget/index.js';
  import { NowPlayingBar } from '$lib/components/NowPlayingBar/index.js';
  import { NowPlayingView } from '$lib/components/NowPlayingView/index.js';
  import { Player } from '$lib/states/index.js';

  const { children } = $props();

  let isNowPlayingViewOpen = $state(false);
  let isChatViewOpen = $state(false);

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
    player.cycleSpeed();
  };

  const handleChatWidgetClick = () => {
    isChatViewOpen = true;
  };

  const handleChatViewClose = () => {
    isChatViewOpen = false;
  };
</script>

{@render children()}

<div class="z-100 pointer-events-none fixed inset-x-0 bottom-0">
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
<ChatView isopen={isChatViewOpen} onclose={handleChatViewClose} />
