<script lang="ts">
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Pause from '@lucide/svelte/icons/pause';
  import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
  import RotateCw from '@lucide/svelte/icons/rotate-cw';
  import SkipBack from '@lucide/svelte/icons/skip-back';
  import SkipForward from '@lucide/svelte/icons/skip-forward';
  import { fade, fly } from 'svelte/transition';

  import Badge from '$lib/components/Badge/Badge.svelte';
  import FloatingChat from '$lib/components/FloatingChat.svelte';
  import FloatingPlayer from '$lib/components/FloatingPlayer.svelte';
  import LearningUnit from '$lib/components/LearningUnit.svelte';
  import { Portal } from '$lib/components/Portal/index.js';
  import { AudioState } from '$lib/helpers/index.js';

  let isModalOpen = $state(false);

  const audioState = AudioState.load();

  const handleFloatingPlayerClick = () => {
    isModalOpen = !isModalOpen;
  };

  const handlePlay = () => {
    audioState.isFloatingPlayerVisible = true;
    audioState.isPlaying = true;
  };

  const togglePlayPause = () => {
    audioState.isPlaying = !audioState.isPlaying;
  };
</script>

<div class="flex flex-col gap-y-3">
  <div class="px-2">
    <span class="text-xl font-semibold">Recently learned</span>
  </div>

  <div class="flex flex-col gap-y-4">
    <LearningUnit
      to="/content/1"
      tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
      title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
      showplayerpanel
      onplay={handlePlay}
    />

    <LearningUnit
      to="/content/1"
      tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
      title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
      showplayerpanel
      onplay={handlePlay}
    />
  </div>
</div>

<div class="z-100 pointer-events-none fixed inset-x-0 bottom-0">
  <div class="mx-auto max-w-5xl px-4 py-3">
    <div class="flex justify-end gap-x-4">
      {#if audioState.isFloatingPlayerVisible}
        <FloatingPlayer
          title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
          isplaying={audioState.isPlaying}
          onplay={togglePlayPause}
          onclick={handleFloatingPlayerClick}
        />
      {/if}

      <FloatingChat />
    </div>
  </div>
</div>

<Portal>
  {#if isModalOpen}
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
            onclick={handleFloatingPlayerClick}
          >
            <ArrowLeft />
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
              <div class="group relative h-2 rounded-full bg-slate-700">
                <div class="h-full w-3/4 rounded-full bg-white"></div>
                <div
                  class="absolute left-3/4 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
                ></div>
              </div>

              <div class="flex justify-between">
                <span>14:32</span>
                <span>-2.00</span>
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
