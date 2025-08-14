<script lang="ts">
  import '../app.css';

  import { ChevronDown, Pause, RotateCcw, RotateCw, SkipBack, SkipForward } from '@lucide/svelte';
  import { fade, fly } from 'svelte/transition';

  import { Badge } from '$lib/components/Badge/index.js';
  import { ChatView } from '$lib/components/ChatView';
  import { ChatWidget } from '$lib/components/ChatWidget/index.js';
  import { NowPlayingBar } from '$lib/components/NowPlayingBar/index.js';
  import { Portal } from '$lib/components/Portal/index.js';
  import { Slider } from '$lib/components/Slider/index.js';
  import { Player } from '$lib/states/index.js';

  const { children } = $props();

  let isNowPlayingViewVisible = $state(false);
  let isChatViewVisible = $state(false);
  let sliderCurrentValue = $state(0);

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

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleValueChange = (value: number) => {
    sliderCurrentValue = value;
  };
</script>

{@render children()}

<div class="z-100 pointer-events-none fixed inset-x-0 bottom-0">
  <div class="mx-auto max-w-5xl px-4 py-3">
    <div class="flex justify-end gap-x-4">
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
</div>

<Portal>
  {#if isNowPlayingViewVisible}
    <!-- Backdrop -->
    <div transition:fade={{ duration: 300 }} class="z-199 fixed inset-0 bg-slate-950/50"></div>

    <!-- Modal -->
    <div
      class="z-200 fixed inset-0 bg-slate-950 text-white"
      transition:fly={{ duration: 300, y: '100%', opacity: 1 }}
    >
      <div class="mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-3">
        <!-- Navigation -->
        <div class="flex items-center">
          <button
            class="cursor-pointer rounded-full p-4 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onclick={handleNowPlayingViewClose}
          >
            <ChevronDown />
          </button>
        </div>

        <div class="flex-1"></div>

        <div class="flex flex-col gap-y-6">
          <!-- Badge and Title -->
          <div class="flex flex-col gap-y-3">
            <Badge variant="purple">Special Educational Needs</Badge>
            <a
              href="/content/1"
              class="w-fit text-xl focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Navigating Special Educational Needs: A Path to Inclusion
            </a>
          </div>

          <div class="flex flex-col gap-y-5">
            <!-- Slider and Timestamp -->
            <div class="flex flex-col gap-y-2">
              <Slider
                min={0}
                max={300}
                step={1}
                value={sliderCurrentValue}
                onvaluechange={handleValueChange}
              />

              <div class="flex justify-between">
                <span>{formatTime(sliderCurrentValue)}</span>
                <span>-{formatTime(300 - sliderCurrentValue)}</span>
              </div>
            </div>

            <!-- Speed Control -->
            <div class="flex justify-center">
              <button
                class="flex cursor-pointer items-center rounded-full bg-white/20 px-4 py-2 transition-colors hover:bg-white/30 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span class="text-sm font-medium">1.0x speed</span>
              </button>
            </div>

            <!-- Playback Controls -->
            <div class="flex justify-between py-4">
              <!-- Backward Button -->
              <button
                class="cursor-pointer rounded-full p-4 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <SkipBack />
              </button>

              <!-- Replay Button -->
              <button
                class="cursor-pointer rounded-full p-4 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <RotateCcw />
              </button>

              <!-- Play/Pause Button -->
              <button
                class="cursor-pointer rounded-full bg-white p-4 text-black transition-colors hover:bg-white/75 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Pause />
              </button>

              <!-- Forward Button -->
              <button
                class="cursor-pointer rounded-full p-4 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <RotateCw />
              </button>

              <!-- Next Button -->
              <button
                class="cursor-pointer rounded-full p-4 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <SkipForward />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</Portal>

<ChatView isvisible={isChatViewVisible} onclose={handleChatViewClose} />
