<script lang="ts">
  import { Collection } from '$lib/components/Collection/index.js';
  import { tagCodeToBadgeVariant } from '$lib/helpers/index.js';

  const { data } = $props();
</script>

<main class="pt-43 relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-3 px-4 pb-28">
  <div class="px-2">
    <span class="text-xl font-semibold">Your learnings</span>
  </div>

  <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
    {#each data.collections as collection (collection.id)}
      <Collection
        to="/collection/{collection.id}"
        title={collection.title}
        type={collection.type}
        tags={collection.tags.map((t) => ({
          variant: tagCodeToBadgeVariant(t.code),
          content: t.label,
        }))}
        numberofpodcasts={collection.numberOfPodcasts}
      />
    {/each}
  </div>
</main>
