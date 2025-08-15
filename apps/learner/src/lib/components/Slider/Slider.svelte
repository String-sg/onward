<script lang="ts">
  import type { PointerEventHandler } from 'svelte/elements';

  import { convertStepsToPercentage, convertValueToSteps, linearScaleValue } from './helper';

  export interface Props {
    /**
     * The minimum value of the Slider.
     *
     * @default '0'
     */
    min?: number;
    /**
     * Maximum value of the Slider.
     *
     * @default '100'
     */
    max?: number;
    /**
     * Increment value for each step of the Slider
     *
     * @default '1'
     */
    step?: number;
    /**
     * The initial value of the Slider.
     *
     * @default '0'
     */
    value?: number;
    /**
     * A callback when the value changes.
     */
    onvaluechange?: (value: number) => void;
  }

  const { min = 0, max = 100, step = 1, value = 0, onvaluechange }: Props = $props();

  let isSliding = $state(false);
  let percentage = $state(0);
  let currentTime = $state(value);

  let slider: HTMLDivElement | null = null;

  // Update percentage and current time when props or state change
  $effect(() => {
    const steps = convertValueToSteps(currentTime, step, [min, max]);
    percentage = convertStepsToPercentage(steps, [min, max]);
  });

  // Handle pointer down and movement
  const updateSlider = (clientX: number) => {
    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const input: [number, number] = [rect.left, rect.right];
    const output: [number, number] = [min, max];
    const value = linearScaleValue(clientX, input, output);
    const steps = convertValueToSteps(value, step, [min, max]);

    currentTime = steps;
    percentage = convertStepsToPercentage(steps, [min, max]);

    onvaluechange?.(steps);
  };

  const handlePointerDown: PointerEventHandler<HTMLDivElement> = (e) => {
    isSliding = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSlider(e.clientX);
  };

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
      return;
    }

    updateSlider(e.clientX);
  };

  const handlePointerUp: PointerEventHandler<HTMLDivElement> = (e) => {
    isSliding = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };
</script>

<!-- Slider -->
<div
  bind:this={slider}
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  class="relative flex h-2 w-full cursor-pointer touch-none items-center rounded-full bg-slate-700"
>
  <!-- Track Background -->
  <div class="h-full w-full rounded-full bg-slate-700">
    <!-- Filled Track -->
    <div style="width: {percentage}%" class="h-full rounded-full bg-white"></div>
  </div>

  <!-- Thumb -->
  <div
    style="left: {percentage}%;"
    class={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-opacity ${
      isSliding ? 'opacity-100' : 'opacity-0 hover:opacity-100'
    }`}
  ></div>
</div>
