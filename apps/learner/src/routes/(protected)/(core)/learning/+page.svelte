<script lang="ts">
  import LinkButton from '$lib/components/Button/LinkButton.svelte';
  import { Collection } from '$lib/components/Collection/index.js';
  import { tagCodeToBadgeVariant } from '$lib/helpers/index.js';

  const { data } = $props();
</script>

<main class="pt-43 relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-3 px-4 pb-28">
  {#if data.collections.length > 0}
    <div class="px-2">
      <span class="text-xl font-semibold">Your learnings</span>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      {#each data.collections as collection (collection.id)}
        <Collection
          to={`/learning/collection/${collection.id}`}
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
  {:else}
    <div class="mt-20 flex flex-col items-center gap-y-8">
      <div class="flex flex-col items-center gap-y-6">
        <enhanced:img src="$lib/assets/fireworks.png?w=200" alt="No learning journey found" />

        <div class="flex flex-col items-center gap-y-2">
          <span class="text-2xl font-semibold">Welcome {data.user}</span>
          Kick off your learning journey by diving into our excisting curated content!
        </div>
      </div>

      <LinkButton href="/explore" width="full" class="max-w-md">Go to explore</LinkButton>
    </div>
  {/if}
</main>
