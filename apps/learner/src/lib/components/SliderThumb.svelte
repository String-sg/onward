<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /**
     * The hardcoded position of the slider thumb, ranging from 0 to 100.
     * @default 0
     */
    position?: number;
  }

  // Destructure props with a default position value
  const { position = 0, ...otherProps }: Props = $props();
</script>

<div
  {...otherProps}
  class="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
  style={`left: ${position}%;`}
></div>
