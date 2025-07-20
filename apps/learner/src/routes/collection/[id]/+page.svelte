<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';
  import { onMount } from 'svelte';

  import LearningUnit from '$lib/components/LearningUnit.svelte';

  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let isWithinViewport = $state(true);

  let target: HTMLElement | null;

  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => {
      isWithinViewport = entry.isIntersecting;
    });

    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  });
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-slate-100/90 backdrop-blur-sm">
  <div
    class={[
      'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
      !isWithinViewport && '!bg-slate-950/7.5',
    ]}
  ></div>

  <div class="mx-auto w-full max-w-5xl px-4 py-3">
    <div class="flex items-center justify-between gap-x-8">
      <div class="flex items-center gap-x-3">
        <a href="/learning" class="rounded-full px-3 py-4 transition-colors hover:bg-slate-200">
          <ArrowLeft />
        </a>

        <span class="text-xl font-medium">{data.collection.title}</span>
      </div>
    </div>
  </div>
</header>

<main class="pt-23 relative mx-auto min-h-full w-full max-w-5xl px-4 pb-3">
  <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

  <div class="flex flex-col gap-y-6">
    <div class="shadow-xs flex flex-col gap-y-2 rounded-3xl bg-slate-200 p-4">
      <span class="text-lg font-medium">About this topic</span>

      <span>
        {data.collection.description}
      </span>
    </div>

    <div class="flex flex-col gap-y-3">
      <div class="px-2">
        <span class="text-xl font-semibold">{data.collection.learningUnits.length} podcasts</span>
      </div>

      <div class="flex flex-col gap-y-4">
        {#each data.collection.learningUnits as learningUnit (learningUnit.id)}
          <LearningUnit
            id={learningUnit.id}
            contentUrl={learningUnit.contentUrl}
            to="/content/{learningUnit.id}"
            duration={learningUnit.duration}
            tags={learningUnit.tags}
            title={learningUnit.title}
          />
        {/each}
      </div>
    </div>
  </div>
</main>
