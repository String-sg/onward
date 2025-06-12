<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="flex flex-wrap gap-1">
  <div class="rounded-md bg-purple-200 px-2.5 py-0.5">
    <span class="text-xs font-semibold text-purple-900">{@render children()}</span>
  </div>
</div>
