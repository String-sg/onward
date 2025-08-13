<script lang="ts">
  import type { PointerEventHandler } from 'svelte/elements';

  export interface Props {
    /**
     * The minimum value of the Slider.
     *
     * @default '0'
     */
    min?: number;
    /**
     * Maximum value of the Slider, e.g., total duration in seconds.
     *
     * @default '300'
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

  const { min = 0, max = 300, step = 1, value = 0, onvaluechange }: Props = $props();

  let percentage = $state(0);

  let currentTime = $state(value);

  let slider: HTMLDivElement | null = null;

  const linearScaleValue = (
    value: number,
    [inputMin, inputMax]: [number, number],
    [outputMin, outputMax]: [number, number],
  ): number => ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin) + outputMin;

  const convertValueToSteps = (value: number, step: number, [min, max]: [number, number]): number =>
    Math.min(max, Math.max(min, Math.round((value - min) / step) * step));

  const convertStepsToPercentage = (steps: number, [min, max]: [number, number]): number =>
    ((steps - min) / (max - min)) * 100;

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
