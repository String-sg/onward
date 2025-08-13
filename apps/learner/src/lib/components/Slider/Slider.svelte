<script lang="ts">
  import type { PointerEventHandler } from 'svelte/elements';

  // Import helper functions or implement them here
  import { convertStepsToPercentage, convertValueToSteps, linearScaleValue } from './helper';

  export type OnValueChange = (value: number) => void;

  interface Props {
    min?: number; // Minimum value (e.g., 0 seconds)
    max?: number; // Maximum value (e.g., total duration in seconds)
    step?: number; // Increment step
    value?: number; // Initial value
    onValueChange?: OnValueChange; // Callback for value change
  }

  const { min = 0, max = 300, step = 1, value = 0, onValueChange }: Props = $props();

  // State variables
  let percentage = $state(0); // Slider position in percentage
  let currentTime = $state(value); // Current time in seconds
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

    // Update state
    currentTime = steps;
    percentage = convertStepsToPercentage(steps, [min, max]);

    // Trigger callback
    onValueChange?.(steps);
  };

  const handlePointerDown: PointerEventHandler<HTMLDivElement> = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updateSlider(e.clientX);
  };

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      updateSlider(e.clientX);
    }
  };

  const handlePointerUp: PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };
</script>

<!-- Slider Component -->
<div class="flex flex-col gap-y-5">
  <!-- Slider -->
  <div
    class="group relative flex h-2 w-full touch-none items-center rounded-full bg-slate-700"
    bind:this={slider}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
  >
    <!-- Track Background -->
    <div class="h-full w-full rounded-full bg-slate-700">
      <!-- Filled Track -->
      <div style="width: {percentage}%" class="h-full rounded-full bg-white"></div>
    </div>

    <!-- Thumb -->
    <div
      style="left: {percentage}%;"
      class="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white opacity-0 transition-opacity group-hover:opacity-100"
    ></div>
  </div>
</div>
