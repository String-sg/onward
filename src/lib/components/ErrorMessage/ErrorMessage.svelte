<script lang="ts">
  export interface Props {
    /**
     * Error message to display
     */
    message?: string;
    /**
     * Additional classes for the error message
     */
    class?: string;
  }

  const { message, class: clazz }: Props = $props();
</script>

{#if message}
  <p class="text-xs text-red-500 {clazz ?? ''}">{message}</p>
{/if}
