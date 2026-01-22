<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLSelectAttributes } from 'svelte/elements';

  export interface Props extends Omit<HTMLSelectAttributes, 'class' | 'value'> {
    /**
     * The value of the select (bindable)
     */
    value?: string | string[] | number;
    /**
     * The options content
     */
    children: Snippet;
  }

  let { value = $bindable(), children, ...restProps }: Props = $props();
</script>

<select
  bind:value
  class="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
  {...restProps}
>
  {@render children()}
</select>
