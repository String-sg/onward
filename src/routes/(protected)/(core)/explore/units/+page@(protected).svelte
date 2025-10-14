<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  import { LearningUnit } from '$lib/components/LearningUnit/index.js';
  import { IsWithinViewport, tagCodeToBadgeVariant } from '$lib/helpers/index.js';
  import { mastheadState } from '$lib/states/index.js';

  const { data } = $props();

  let target = $state<HTMLElement | null>(null);

  const isWithinViewport = new IsWithinViewport(() => target);
</script>

<header
  class="fixed inset-x-0 top-0 z-50 bg-slate-100/90 backdrop-blur-sm"
  style="padding-top: {mastheadState.height}px;"
>
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
      </div>
    </div>
  </div>
</header>

<div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

<main
  class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-6 px-4 pb-28"
  style="padding-top: {mastheadState.height + 92}px;"
>
  <div class="flex flex-col gap-y-3">
    <div class="px-2">
      <span class="text-xl font-semibold">Learning Units</span>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      {#each data.learningUnits as learningUnit (learningUnit.id)}
        <LearningUnit
          to="/unit/{learningUnit.id}"
          tags={learningUnit.tags.map((t) => ({
            variant: tagCodeToBadgeVariant(t.code),
            content: t.label,
          }))}
          title={learningUnit.title}
          createdat={learningUnit.createdAt}
          createdby={learningUnit.createdBy}
        />
      {/each}
    </div>
  </div>
</main>
