<script lang="ts">
  import { Collection, type CollectionProps } from '$lib/components/Collection/index.js';

  const { data } = $props();
</script>

<main class="pt-43 relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-3 px-4 pb-28">
  <div class="px-2">
    <span class="text-xl font-semibold">Your learnings</span>
  </div>

  <div class="flex flex-col gap-y-4">
    {#each data.collections as collection (collection.id)}
      <Collection
        to={collection.to}
        tag={collection.tag}
        title={collection.title}
        numberofpodcasts={collection.numberofpodcasts}
        numberofnotes={collection.numberofnotes}
        type={collection.variant as CollectionProps['type']}
      />
    {/each}
  </div>
</main>
