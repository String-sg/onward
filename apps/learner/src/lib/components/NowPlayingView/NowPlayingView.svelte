<script lang="ts">
  import { ChevronDown, Pause, Play, RotateCcw, RotateCw } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  import { Badge } from '$lib/components/Badge/index.js';
  import { Modal, type ModalProps } from '$lib/components/Modal/index.js';
  import { Slider, type SliderProps } from '$lib/components/Slider/index.js';
  import { formatTime } from '$lib/helpers/index.js';
  import { Player } from '$lib/states/index.js';

  export interface Props {
    /**
     * Indicates whether the view is open.
     */
    isopen: ModalProps['isopen'];
    /**
     * A callback invoked when the view is closed.
     */
    onclose: ModalProps['onclose'];
  }

  const { isopen, onclose }: Props = $props();

  let playbackSpeed = $state(1.0);

  const player = Player.get();

  const speedOptions = [0.5, 1.0, 1.5, 2.0];

  const handleClose: MouseEventHandler<HTMLButtonElement> = () => {
    onclose();
  };

  const handlePositionChange: SliderProps['onvaluechange'] = (value) => {
    player.seek(value);
  };

  const handlePlayPause = () => {
    player.toggle();
  };

  const handleSkipBack = () => {
    const newPosition = Math.max(0, player.progress - 10);

    player.seek(newPosition);
  };

  const handleSkipForward = () => {
    const newPosition = Math.min(player.duration, player.progress + 10);

    player.seek(newPosition);
  };

  const handleSpeedChange = () => {
    const currentIndex = speedOptions.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    playbackSpeed = speedOptions[nextIndex];

    player.setSpeed(playbackSpeed);
  };
</script>

<Modal {isopen} {onclose} variant="dark">
  <div class="mx-auto flex min-h-svh max-w-5xl flex-col gap-y-4 px-4 py-3">
    <!-- Navigation -->
    <div class="flex items-center">
      <button
        class="cursor-pointer rounded-full p-4 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onclick={handleClose}
      >
        <ChevronDown />
      </button>
    </div>

    <div class="flex-1"></div>

    <div class="flex flex-col gap-y-6">
      <!-- Badge and Title -->
      <div class="flex flex-col gap-y-3">
        {#if player.currentTrack}
          <Badge variant="purple">{player.currentTrack.tags?.[0]}</Badge>
          <a
            href={`/content/${player.currentTrack.id}`}
            class="w-fit text-xl focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {player.currentTrack.title}
          </a>
        {/if}
      </div>

      <div class="flex flex-col gap-y-5">
        <!-- Slider and Timestamp -->
        <div class="flex flex-col gap-y-2">
          <Slider
            min={0}
            max={player.duration}
            step={1}
            value={player.progress}
            onvaluechange={handlePositionChange}
          />

          <div class="flex justify-between">
            <span>{formatTime(player.progress)}</span>
            <span>-{formatTime(player.duration - player.progress)}</span>
          </div>
        </div>

        <!-- Speed Control -->
        <div class="flex justify-center">
          <button
            class="flex cursor-pointer items-center rounded-full bg-white/20 px-4 py-2 transition-colors hover:bg-white/30 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onclick={handleSpeedChange}
          >
            <span class="text-sm font-medium">{playbackSpeed.toFixed(1)}x speed</span>
          </button>
        </div>

        <!-- Playback Controls -->
        <div class="flex justify-evenly py-4">
          <!-- Skip Back Button -->
          <button
            class="cursor-pointer rounded-full p-3 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4"
            onclick={handleSkipBack}
          >
            <RotateCcw />
          </button>

          <!-- Play/Pause Button -->
          <button
            class="cursor-pointer rounded-full bg-white p-3 text-black transition-colors hover:bg-white/75 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4"
            onclick={handlePlayPause}
          >
            {#if player.isPlaying}
              <Pause />
            {:else}
              <Play />
            {/if}
          </button>

          <!-- Skip Forward Button -->
          <button
            class="cursor-pointer rounded-full p-3 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4"
            onclick={handleSkipForward}
          >
            <RotateCw />
          </button>
        </div>
      </div>
    </div>
  </div>
</Modal>
