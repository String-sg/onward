<script lang="ts">
  import { ChevronDown, Pause, Play, RotateCcw, RotateCw } from '@lucide/svelte';
  import DOMPurify from 'dompurify';
  import { marked } from 'marked';

  import { Badge } from '$lib/components/Badge/index.js';
  import { Modal, type ModalProps } from '$lib/components/Modal/index.js';
  import { Slider, type SliderProps } from '$lib/components/Slider/index.js';
  import { formatTime, tagCodeToBadgeVariant } from '$lib/helpers/index.js';
  import type { Track } from '$lib/states/index.js';

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
    currenttrack: Track;
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

  const handleClose = () => {
    onclose();
  };

  const handlePositionChange: SliderProps['onvaluechange'] = (value) => {
    onseek(value);
  };
</script>

<Modal {isopen} {onclose} variant="dark">
  <div class="mx-auto flex h-svh max-w-5xl flex-col gap-y-4 px-4 py-3">
    <!-- Navigation -->
    <div class="flex items-center">
      <button
        onclick={handleClose}
        class="cursor-pointer rounded-full p-4 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed"
      >
        <ChevronDown />
      </button>
    </div>

    <div class="overflow-y-auto mask-t-from-98% mask-b-from-90%">
      <div class="prose prose-white max-w-none pb-4 text-xl">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html DOMPurify.sanitize(marked.parse(currenttrack.summary, { async: false }))}
      </div>
    </div>

    <div class="mt-auto flex flex-col gap-y-6">
      <!-- Badge and Title -->
      <div class="flex flex-col gap-y-3">
        <Badge variant={tagCodeToBadgeVariant(currenttrack.tags?.[0].code)}>
          {currenttrack.tags?.[0].label}
        </Badge>

        <a
          href={`/unit/${currenttrack.id}`}
          class="w-fit text-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed"
          onclick={handleClose}
        >
          {currenttrack.title}
        </a>
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
            onclick={onspeedchange}
            class="flex cursor-pointer items-center rounded-full bg-white/20 px-4 py-2 transition-colors hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed"
          >
            <span class="text-sm font-medium">{playbackspeed.toFixed(1)}x speed</span>
          </button>
        </div>

        <!-- Playback Controls -->
        <div class="flex justify-evenly py-4">
          <!-- Skip Back Button -->
          <button
            onclick={onskipback}
            class="cursor-pointer rounded-full p-3 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed sm:p-4"
          >
            <RotateCcw />
          </button>

          <!-- Play/Pause Button -->
          <button
            onclick={onplaypause}
            class="cursor-pointer rounded-full bg-white p-3 text-black transition-colors hover:bg-white/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed sm:p-4"
          >
            {#if isplaying}
              <Pause />
            {:else}
              <Play />
            {/if}
          </button>

          <!-- Skip Forward Button -->
          <button
            onclick={onskipforward}
            class="cursor-pointer rounded-full p-3 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white focus-visible:outline-dashed sm:p-4"
          >
            <RotateCw />
          </button>
        </div>
      </div>
    </div>
  </div>
</Modal>
