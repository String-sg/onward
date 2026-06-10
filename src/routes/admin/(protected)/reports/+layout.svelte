<script lang="ts">
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
</script>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  {@render children()}
</div>
