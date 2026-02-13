<script lang="ts">
  import { Collection } from '$lib/components/Collection/index.js';
  import { EmptyStateView } from '$lib/components/EmptyStateView/index.js';

  const { data } = $props();
</script>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-3 px-4 pt-43 pb-28">
  {#if data.collections.length > 0}
    <div class="px-2">
      <span class="text-xl font-semibold">Your learnings</span>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      {#each data.collections as collection (collection.id)}
        <Collection
          to={`/learning/collection/${collection.id}`}
          title={collection.title}
          type={collection.tagCode}
          numberofpodcasts={collection.numberOfPodcasts}
        />
      {/each}
    </div>
  {:else}
    <div class="mt-8 flex flex-col items-center gap-y-5">
      <EmptyStateView username={data.username} imagealt="No learning journeys found" />
    </div>
  {/if}
</main>
