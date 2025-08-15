<script lang="ts">
  import { ChevronDown, Pause, RotateCcw, RotateCw, SkipBack, SkipForward } from '@lucide/svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  import { Badge } from '$lib/components/Badge/index.js';
  import { Modal, type ModalProps } from '$lib/components/Modal/index.js';

  export interface Props {
    /**
     * Indicates the visibility of the view.
     */
    isvisible: ModalProps['isvisible'];
    /**
     * A callback invoked when the view is closed.
     */
    onclose: ModalProps['onclose'];
  }

  const { isvisible, onclose }: Props = $props();

  const handleClose: MouseEventHandler<HTMLButtonElement> = () => {
    onclose();
  };
</script>

<Modal {isvisible} {onclose} variant="dark">
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
            class="cursor-pointer rounded-full p-3 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4"
          >
            <SkipBack />
          </button>

          <!-- Replay Button -->
          <button
            class="cursor-pointer rounded-full p-3 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4"
          >
            <RotateCcw />
          </button>

          <!-- Play/Pause Button -->
          <button
            class="cursor-pointer rounded-full bg-white p-3 text-black transition-colors hover:bg-white/75 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4"
          >
            <Pause />
          </button>

          <!-- Forward Button -->
          <button
            class="cursor-pointer rounded-full p-3 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4"
          >
            <RotateCw />
          </button>

          <!-- Next Button -->
          <button
            class="cursor-pointer rounded-full p-3 transition-colors hover:bg-white/20 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:p-4"
          >
            <SkipForward />
          </button>
        </div>
      </div>
    </div>
  </div>
</Modal>
