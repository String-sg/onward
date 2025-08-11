<script lang="ts">
  import { ArrowLeft, Pause, RotateCcw, RotateCw, SkipBack, SkipForward } from '@lucide/svelte';
  import { fade, fly } from 'svelte/transition';

  import { Badge } from '$lib/components/Badge/index.js';
  import { FloatingChat } from '$lib/components/FloatingChat/index.js';
  import { FloatingPlayer } from '$lib/components/FloatingPlayer/index.js';
  import { LearningUnit } from '$lib/components/LearningUnit/index.js';
  import { Portal } from '$lib/components/Portal/index.js';
  import { Player } from '$lib/states/index.js';

  const { data } = $props();

  let isNowPlayingViewVisible = $state(false);

  const player = Player.get();

  const handleNowPlayingBarClick = () => {
    isNowPlayingViewVisible = true;
  };

  const handleNowPlayingBarPlay = () => {
    player.toggle();
  };

  const handleNowPlayingViewClose = () => {
    isNowPlayingViewVisible = false;
  };

  const handleLearningUnitPlay = (learningUnit: (typeof data.learningUnits)[0]) => {
    player.play({
      id: learningUnit.id,
      title: learningUnit.title,
    });
  };

  const handleLearningUnitPause = () => {
    player.toggle();
  };

  const handleLearningUnitResume = () => {
    player.toggle();
  };
</script>

<div class="flex flex-col gap-y-3">
  <div class="px-2">
    <span class="text-xl font-semibold">Recently learned</span>
  </div>

  <div class="flex flex-col gap-y-4">
    {#each data.learningUnits as learningUnit (learningUnit.id)}
      <LearningUnit
        to={`/content/${learningUnit.id}`}
        tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
        title={learningUnit.title}
        player={{
          isactive: player.currentTrack?.id === learningUnit.id,
          isplaying: player.isPlaying,
          onplay: () => handleLearningUnitPlay(learningUnit),
          onpause: handleLearningUnitPause,
          onresume: handleLearningUnitResume,
        }}
      />
    {/each}
  </div>
</div>

<div class="z-100 pointer-events-none fixed inset-x-0 bottom-0">
  <div class="mx-auto max-w-5xl px-4 py-3">
    <div class="flex justify-end gap-x-4">
      {#if player.currentTrack}
        <FloatingPlayer
          title={player.currentTrack.title}
          isplaying={player.isPlaying}
          onclick={handleNowPlayingBarClick}
          onplay={handleNowPlayingBarPlay}
        />
      {/if}

      <FloatingChat />
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
