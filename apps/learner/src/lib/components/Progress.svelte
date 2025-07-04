<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /**
     * The progress value, between 0 and 100.
     * Defaults to 0 if not provided.
     */
    value?: number;
  }

  const { value = 0, ...otherProps }: Props = $props();
</script>

<div {...otherProps} class="relative h-3 w-full overflow-hidden rounded-full bg-white">
  <div
    class="h-full w-full flex-1 bg-slate-900 transition-all"
    style="transform: translateX(-{100 - value}%)"
  ></div>
</div>
