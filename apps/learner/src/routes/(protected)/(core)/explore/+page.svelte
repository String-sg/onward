<script lang="ts">
  import { Collection, type CollectionProps } from '$lib/components/Collection/index.js';
  import { LearningUnit, type LearningUnitProps } from '$lib/components/LearningUnit/index.js';

  const { data } = $props();
</script>

<main class="pt-43 relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-6 px-4 pb-28">
  <div class="flex flex-col gap-y-3">
    <div class="flex flex-row justify-between px-2">
      <span class="text-xl font-semibold">Learning units</span>
      <a
        href="/units"
        class="rounded-2xl px-4 py-2 text-sm font-medium hover:bg-slate-200 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
      >
        See all
      </a>
    </div>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      {#each data.learningUnits as learningUnit (learningUnit.id)}
        <LearningUnit
          to={learningUnit.to}
          tags={learningUnit.tags as LearningUnitProps['tags']}
          title={learningUnit.title}
        />
      {/each}
    </div>
  </div>

  <div class="flex flex-col gap-y-3">
    <div class="flex flex-row justify-between px-2">
      <span class="text-xl font-semibold">Learning topics</span>
      <a
        href="/topics"
        class="rounded-2xl px-4 py-2 text-sm font-medium hover:bg-slate-200 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
      >
        See all
      </a>
    </div>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      {#each data.collections as collection (collection.id)}
        <Collection
          to={collection.to}
          tag={collection.tag}
          title={collection.title}
          numberofpodcasts={collection.numberofpodcasts}
          type={collection.type as CollectionProps['type']}
        />
      {/each}
    </div>
  </div>
</main>
