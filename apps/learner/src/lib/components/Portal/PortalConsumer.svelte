<script lang="ts">
  import type { Snippet } from 'svelte';

  export interface Props {
    children?: Snippet;
  }

  const { children }: Props = $props();
</script>

{#key children}
  {@render children?.()}
{/key}
