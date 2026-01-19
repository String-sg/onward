<script lang="ts">
  import type { Snippet } from 'svelte';

  import { ErrorMessage } from '$lib/components/ErrorMessage';

  export interface Props {
    /**
     * The label text for the form field
     */
    label: string;
    /**
     * The id attribute to connect label and input
     */
    id: string;
    /**
     * Whether the field is required
     * @default false
     */
    required?: boolean;
    /**
     * Error message to display
     */
    error?: string;
    /**
     * The input/select/textarea content
     */
    children: Snippet;
  }

  const { label, id, required = false, error, children }: Props = $props();
</script>

<div class="flex flex-col gap-2">
  <label for={id} class="block">
    {label}
    {#if required}
      <span class="text-red-500">*</span>
    {/if}
  </label>

  {@render children()}

  <ErrorMessage message={error} />
</div>
