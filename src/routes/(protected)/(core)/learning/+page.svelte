<script lang="ts">
  import LinkButton from '$lib/components/Button/LinkButton.svelte';
  import { Collection } from '$lib/components/Collection/index.js';

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
          type={collection.type}
          numberofpodcasts={collection.numberOfPodcasts}
        />
      {/each}
    </div>
  {:else}
    <div class="mt-20 flex flex-col items-center gap-y-8">
      <div class="flex flex-col items-center gap-y-6">
        <enhanced:img
          src="$lib/assets/bags-of-bites.png?w=708"
          alt="No learning journeys found"
          class="w-[354px]"
        />

        <div class="flex flex-col items-center gap-y-2 text-center">
          <span class="text-xl font-medium">Welcome {data.username}</span>
          <span>
            Kick off your learning journey by diving<br /> into our exciting curated content!
          </span>
        </div>
      </div>

      <LinkButton href="/explore" width="full" class="max-w-md">Go to explore</LinkButton>
    </div>
  {/if}

  <a
    href="https://form.gov.sg/68b7d5099b55d364153be0d5"
    target="_blank"
    class="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-800"
  >
    share feedback
  </a>
</main>
