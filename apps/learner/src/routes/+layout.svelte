<script lang="ts">
  import '../app.css';

  import { ChatView } from '$lib/components/ChatView/index.js';
  import { ChatWidget } from '$lib/components/ChatWidget/index.js';
  import { NowPlayingBar } from '$lib/components/NowPlayingBar/index.js';
  import { NowPlayingView } from '$lib/components/NowPlayingView/index.js';
  import { Player } from '$lib/states/index.js';

  const { children } = $props();

  let isNowPlayingViewVisible = $state(false);
  let isChatViewVisible = $state(false);

  const player = Player.create();

  const handleNowPlayingBarClick = () => {
    isNowPlayingViewVisible = true;
  };

  const handleNowPlayingBarPlay = () => {
    player.toggle();
  };

  const handleNowPlayingViewClose = () => {
    isNowPlayingViewVisible = false;
  };

  const handleChatWidgetClick = () => {
    isChatViewVisible = true;
  };

  const handleChatViewClose = () => {
    isChatViewVisible = false;
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

<NowPlayingView isvisible={isNowPlayingViewVisible} onclose={handleNowPlayingViewClose} />

<ChatView isvisible={isChatViewVisible} onclose={handleChatViewClose} />
