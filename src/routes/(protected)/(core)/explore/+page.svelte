<script lang="ts">
  import { Collection } from '$lib/components/Collection/index.js';
  import { LearningUnit } from '$lib/components/LearningUnit/index.js';

  const { data } = $props();
</script>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-6 px-4 pt-43 pb-28">
  <div class="flex flex-col gap-y-3">
    <div class="flex flex-row justify-between px-2">
      <span class="text-xl font-semibold">Learning bites</span>
      <a
        href="/explore/units"
        class="rounded-2xl px-4 py-2 text-sm font-medium hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
      >
        See all
      </a>
    </div>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      {#each data.learningUnits as learningUnit (learningUnit.id)}
        <LearningUnit
          to="/unit/{learningUnit.id}"
          tags={learningUnit.tags}
          title={learningUnit.title}
          createdat={learningUnit.createdAt}
          createdby={learningUnit.createdBy}
        />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-y-3">
    <div class="flex flex-row justify-between px-2">
      <span class="text-xl font-semibold">Learning topics</span>
    </div>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      {#each data.collections as collection (collection.id)}
        {#if collection.numberOfPodcasts > 0}
          <Collection
            to="/explore/collection/{collection.id}"
            title={collection.title}
            type={collection.type}
            numberofpodcasts={collection.numberOfPodcasts}
          />
        {/if}
      {/each}
    </div>
  </div>
</main>
