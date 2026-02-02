<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import { ErrorMessage } from '$lib/components/ErrorMessage';

  export interface Props extends Omit<HTMLInputAttributes, 'type' | 'class' | 'checked'> {
    /**
     * The form label text.
     */
    label: string;
    /**
     * The checked state.
     */
    checked?: boolean;
    /**
     * Error message to display
     */
    error?: string;
  }

  let { label, checked = $bindable(false), error, ...restProps }: Props = $props();
</script>

<div class="flex flex-col gap-2">
  <label class="flex flex-row items-center">
    <input
      type="checkbox"
      bind:checked
      class={[
        'h-4 w-4 rounded border-slate-200 accent-slate-950',
        'focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed',
      ]}
      {...restProps}
    />

    <span class="ml-2">{label}</span>
  </label>

  <ErrorMessage message={error} />
</div>
