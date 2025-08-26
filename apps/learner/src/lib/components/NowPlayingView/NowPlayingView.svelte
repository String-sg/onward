<script lang="ts">
  import { ChevronDown, Pause, Play, RotateCcw, RotateCw } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  import { Badge } from '$lib/components/Badge/index.js';
  import { Modal, type ModalProps } from '$lib/components/Modal/index.js';
  import { Slider, type SliderProps } from '$lib/components/Slider/index.js';
  import { formatTime } from '$lib/helpers/index.js';

  export interface Props {
    /**
     * Indicates whether the view is open.
     */
    isopen: ModalProps['isopen'];
    /**
     * A callback invoked when the view is closed.
     */
    onclose: ModalProps['onclose'];
    /**
     * Indicates whether the player is currently playing.
     */
    isplaying: boolean;
    /**
     * The current playback speed of the audio.
     */
    playbackspeed: number;
    /**
     * The total duration of the current track in seconds.
     */
    duration: number;
    /**
     * The current playback progress in seconds.
     */
    progress: number;
    /**
     * Metadata of the current track being played.
     */
    currenttrack: { id: number; tags: string[]; title: string } | null;
    /**
     * A callback to handle when the play/pause button is clicked.
     */
    onplaypause: () => void;
    /**
     * A callback to handle when the slider's value changes.
     */
    onseek: (value: number) => void;
    /**
     * A callback to handle when the skip-back button is clicked.
     */
    onskipback: () => void;
    /**
     * Callback to handle when the skip-forward button is clicked.
     */
    onskipforward: () => void;
    /**
     * Callback to handle when the playback speed is changed.
     */
    onspeedchange: () => void;
  }

  const {
    isopen,
    onclose,
    isplaying,
    playbackspeed,
    duration,
    progress,
    currenttrack,
    onplaypause,
    onseek,
    onskipback,
    onskipforward,
    onspeedchange,
  }: Props = $props();

  const handleClose: MouseEventHandler<HTMLButtonElement> = () => {
    onclose();
  };

  const handlePositionChange: SliderProps['onvaluechange'] = (value) => {
    onseek(value);
  };

  const handleSpeedChange = () => {
    onspeedchange();
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
        {#if currenttrack}
          <Badge variant="purple">{currenttrack.tags?.[0]}</Badge>
          <a
            href={`/content/${currenttrack.id}`}
            class="w-fit text-xl focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {currenttrack.title}
          </a>
        {/if}
      </div>

      <div class="flex flex-col gap-y-5">
        <!-- Slider and Timestamp -->
        <div class="flex flex-col gap-y-2">
          <Slider
            min={0}
            max={duration}
            step={1}
            value={progress}
            onvaluechange={handlePositionChange}
          />

          <div class="flex justify-between">
            <span>{formatTime(progress)}</span>
            <span>-{formatTime(duration - progress)}</span>
          </div>
        </div>

        <!-- Speed Control -->
        <div class="flex justify-center">
          <button
            class="flex cursor-pointer items-center rounded-full bg-white/20 px-4 py-2 transition-colors hover:bg-white/30 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onclick={handleSpeedChange}
          >
            <span class="text-sm font-medium">{playbackspeed.toFixed(1)}x speed</span>
          </button>
        </div>

        <!-- Playback Controls -->
        <div class="flex justify-evenly py-4">
          <!-- Skip Back Button -->
          <button
            class="cursor-pointer rounded-full p-3 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4"
            onclick={onskipback}
          >
            <RotateCcw />
          </button>

          <!-- Play/Pause Button -->
          <button
            class="cursor-pointer rounded-full bg-white p-3 text-black transition-colors hover:bg-white/75 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4"
            onclick={onplaypause}
          >
            {#if isplaying}
              <Pause />
            {:else}
              <Play />
            {/if}
          </button>

          <!-- Skip Forward Button -->
          <button
            class="cursor-pointer rounded-full p-3 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4"
            onclick={onskipforward}
          >
            <RotateCw />
          </button>
        </div>
      </div>
    </div>
  </div>
</Modal>
