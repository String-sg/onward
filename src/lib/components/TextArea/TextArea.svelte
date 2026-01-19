<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  export interface Props extends Omit<HTMLTextareaAttributes, 'class'> {
    /**
     * The value of the textarea
     */
    value?: string;
    /**
     * Number of visible text rows
     * @default 8
     */
    rows?: number;
  }

  let { value = $bindable(), rows = 8, ...restProps }: Props = $props();
</script>

<textarea
  bind:value
  {rows}
  class="w-full resize-none rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
  {...restProps}
></textarea>
