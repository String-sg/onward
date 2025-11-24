<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  import { Badge } from '$lib/components/Badge/index.js';
  import { LearningUnit } from '$lib/components/LearningUnit/index.js';
  import { IsWithinViewport } from '$lib/helpers/index.js';

  const { data } = $props();

  let target = $state<HTMLElement | null>(null);

  const isWithinViewport = new IsWithinViewport(() => target);
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-sm">
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
          href="/explore"
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
    class={[
      'flex flex-col gap-y-2 rounded-3xl border border-slate-200 p-6',
      data.collection.type === 'BOB' && 'bg-blue-50',
      data.collection.type === 'AI' && 'bg-cyan-50',
      data.collection.type === 'NEWS' && 'bg-orange-50',
      data.collection.type === 'PROD' && 'bg-emerald-50',
      data.collection.type === 'CAREER' && 'bg-violet-50',
      data.collection.type === 'INNOV' && 'bg-pink-50',
      data.collection.type === 'WELLBEING' && 'bg-teal-50',
      data.collection.type === 'STU_WELL' && 'bg-sky-50',
      data.collection.type === 'STU_DEV' && 'bg-green-50',
    ]}
  >
    <span class="text-lg font-medium">About this topic</span>

    {#if data.collection.type === 'BOB'}
      <Badge variant="blue">Learn with BOB</Badge>
    {:else if data.collection.type === 'AI'}
      <Badge variant="cyan">Artificial Intelligence</Badge>
    {:else if data.collection.type === 'NEWS'}
      <Badge variant="orange">In the news</Badge>
    {:else if data.collection.type === 'PROD'}
      <Badge variant="emerald">Productivity</Badge>
    {:else if data.collection.type === 'CAREER'}
      <Badge variant="violet">Career growth</Badge>
    {:else if data.collection.type === 'INNOV'}
      <Badge variant="pink">Innovation</Badge>
    {:else if data.collection.type === 'WELLBEING'}
      <Badge variant="teal">Wellbeing</Badge>
    {:else if data.collection.type === 'STU_WELL'}
      <Badge variant="sky">Student wellbeing</Badge>
    {:else if data.collection.type === 'STU_DEV'}
      <Badge variant="green">Student development</Badge>
    {/if}

    <p>
      {data.collection.description}
    </p>
  </div>

  <div class="flex flex-col gap-y-3">
    <div class="px-2">
      <span class="text-xl font-medium">
        {data.learningUnits.length}&nbsp{data.learningUnits.length === 1 ? 'podcast' : 'podcasts'}
      </span>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      {#each data.learningUnits as learningUnit (learningUnit.id)}
        <LearningUnit
          to="/unit/{learningUnit.id}"
          tags={learningUnit.tags}
          title={learningUnit.title}
          createdat={learningUnit.createdAt}
          createdby={learningUnit.createdBy}
          status={learningUnit.status}
        />
      {/each}
    </div>
  </div>
</main>
