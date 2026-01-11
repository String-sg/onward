<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  export interface Props extends Omit<HTMLInputAttributes, 'type' | 'class'> {
    /**
     * The label text for the checkbox
     */
    label: string;
    /**
     * Additional classes for the label wrapper
     */
    class?: string;
  }

  const { label, class: clazz, ...otherProps }: Props = $props();
</script>

<label class={['flex items-center', clazz]}>
  <input
    type="checkbox"
    class={[
      'h-4 w-4 rounded border-slate-200 accent-slate-950',
      'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed',
    ]}
    {...otherProps}
  />

  <span class="ml-2 text-sm">{label}</span>
</label>
