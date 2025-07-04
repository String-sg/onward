<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /**
     * The current progress value, ranging from 0 to 100.
     *
     * @default 0
     */
    value?: number;
  }

  const { value = 0, ...otherProps }: Props = $props();
</script>

<div {...otherProps} class="relative h-3 w-full overflow-hidden rounded-full bg-white">
  <div class="absolute inset-y-0 left-0 bg-slate-900 transition-all" style:width="{value}%"></div>
</div>
