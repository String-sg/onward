<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface Props {
    /**
     * The content to render within the portal.
     */
    children?: Snippet;
  }

  const { children }: Props = $props();
</script>

{#key children}
  {@render children?.()}
{/key}
