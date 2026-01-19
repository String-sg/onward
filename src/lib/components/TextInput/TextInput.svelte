<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  export interface Props extends Omit<HTMLInputAttributes, 'type' | 'class'> {
    /**
     * The type of input
     */
    type: 'text' | 'url';
    /**
     * The value of the input
     */
    value?: string;
  }

  let { value = $bindable(), type, ...restProps }: Props = $props();
</script>

<input
  {type}
  bind:value
  class="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
  {...restProps}
/>
