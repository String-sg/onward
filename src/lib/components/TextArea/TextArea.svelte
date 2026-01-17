<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  export interface Props extends Omit<HTMLTextareaAttributes, 'class'> {
    /**
     * The value of the textarea
     */
    value?: string;
    /**
     * Additional classes for the textarea
     */
    class?: string;
  }

  let { value = $bindable(''), class: clazz, ...restProps }: Props = $props();
</script>

<textarea
  bind:value
  class={[
    'w-full resize-none rounded-md border border-slate-300 px-3 py-2 shadow-sm',
    'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed',
    clazz,
  ]}
  {...restProps}
></textarea>
