<script lang="ts">
  const { children } = $props();
</script>

<main class="mx-auto flex h-full w-full max-w-5xl flex-col">
  {@render children()}
</main>
