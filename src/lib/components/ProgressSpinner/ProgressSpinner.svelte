<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  export interface Props extends HTMLAttributes<HTMLDivElement> {
    /**
     * The current progress value, ranging from 0 to 100.
     *
     * @default 0
     */
    value?: number;
    /**
     * The total duration of the content in seconds.
     */
    duration?: number;
    /**
     * The current time elapsed in seconds.
     */
    currentTime?: number;
  }

  const { value = 0, duration = 0, currentTime = 0 }: Props = $props();

  const radius = 9;
  const circumference = 2 * Math.PI * radius;

  const progress = $derived(
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : Math.min(value, 100),
  );

  const dashArray = $derived(circumference);
  const dashOffset = $derived(circumference - (progress / 100) * circumference);
</script>

<svg viewBox="0 0 24 24" class="h-6 w-6">
  <!-- Background track -->
  <circle cx="12" cy="12" r={radius} stroke="#020617" fill="none" stroke-width="3px" />
  <!-- Progress arc -->
  <circle
    cx="12"
    cy="12"
    r={radius}
    stroke="#E2E8F0"
    fill="none"
    stroke-width="3.5px"
    stroke-linecap="round"
    stroke-dasharray={dashArray}
    stroke-dashoffset={dashOffset}
    transform="rotate(-90 12 12)"
    class="transition-all duration-300 ease-out"
  />
</svg>
