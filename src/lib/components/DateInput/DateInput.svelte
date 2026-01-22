<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  export interface Props extends Omit<HTMLInputAttributes, 'type' | 'class'> {
    /**
     * The value of the date input
     */
    value?: string;
  }

  let { value = $bindable(''), ...restProps }: Props = $props();
</script>

<input
  type="date"
  bind:value
  class="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
  {...restProps}
/>
