<script lang="ts">
  export interface Props {
    /**
     * Error message to display
     */
    message?: string;
  }

  const { message }: Props = $props();
</script>

{#if message}
  <span class="text-xs text-red-500">{message}</span>
{/if}
