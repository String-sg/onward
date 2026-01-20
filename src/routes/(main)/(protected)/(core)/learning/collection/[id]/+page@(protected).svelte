<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  import { Badge } from '$lib/components/Badge/index.js';
  import { LearningUnit } from '$lib/components/LearningUnit/index.js';
  import { COLLECTION_BG_COLOR, getBadgeInfo, IsWithinViewport } from '$lib/helpers/index.js';

  let target = $state<HTMLElement | null>(null);

  const isWithinViewport = new IsWithinViewport(() => target);

  const { data } = $props();
</script>

<header class="fixed inset-x-0 z-50 bg-white/90 backdrop-blur-sm">
  <div
    class={[
      'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
      !isWithinViewport.current && '!bg-slate-950/7.5',
    ]}
  ></div>

  <div class="mx-auto w-full max-w-5xl px-4 py-3">
    <div class="flex items-center justify-between gap-x-8">
      <div class="flex items-center gap-x-3">
        <a
          href="/learning"
          class="rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
        >
          <ArrowLeft />
        </a>

        <span class="text-xl font-medium">{data.collection.title}</span>
      </div>
    </div>
  </div>
</header>

<div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-6 px-4 pt-23 pb-28">
  <div
    class="flex flex-col gap-y-2 rounded-3xl border border-slate-200 p-6 {COLLECTION_BG_COLOR[
      data.collection.type
    ]}"
  >
    <span class="text-lg font-medium">About this topic</span>

    {#if data.collection.type}
      {@const badgeInfo = getBadgeInfo(data.collection.type)}
      <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
    {/if}

    <p>
      {data.collection.description}
    </p>
  </div>

  {#if data.journeys.inProgress.length > 0}
    <div class="flex flex-col gap-y-3">
      <div class="px-2">
        <span class="text-xl font-medium">In Progress</span>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        {#each data.journeys.inProgress as journey (journey.id)}
          <LearningUnit
            to="/unit/{journey.unitId}"
            tags={journey.tags}
            title={journey.title}
            createdat={journey.createdAt}
            createdby={journey.createdBy}
            status={journey.status}
          />
        {/each}
      </div>
    </div>
  {/if}

  {#if data.journeys.isCompleted.length > 0}
    <div class="flex flex-col gap-y-3">
      <div class="px-2">
        <span class="text-xl font-medium">Completed</span>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        {#each data.journeys.isCompleted as journey (journey.id)}
          <LearningUnit
            to="/unit/{journey.unitId}"
            tags={journey.tags}
            title={journey.title}
            createdat={journey.createdAt}
            createdby={journey.createdBy}
            status={journey.status}
          />
        {/each}
      </div>
    </div>
  {/if}
</main>
