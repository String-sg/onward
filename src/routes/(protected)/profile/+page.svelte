<script lang="ts">
  import { ArrowLeft, BookOpenCheck, Lightbulb } from '@lucide/svelte';

  import { afterNavigate } from '$app/navigation';
  import { Button, LinkButton } from '$lib/components/Button';
  import { IsWithinViewport } from '$lib/helpers/index.js';

  const { data } = $props();

  let target = $state<HTMLElement | null>(null);
  let returnTo = $state('/');
  let frequency = $state<'Weekly' | 'Monthly'>('Weekly');

  const isWithinViewport = new IsWithinViewport(() => target);

  afterNavigate(({ from }) => {
    if (from && (from.url.pathname === '/explore' || from.url.pathname === '/learning')) {
      returnTo = from.url.pathname;
      return;
    }

    returnTo = '/';
  });

  const handleFrequencyChange = () => {
    frequency = frequency === 'Weekly' ? 'Monthly' : 'Weekly';
  };
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-slate-100/90 backdrop-blur-sm">
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
          href={returnTo}
          class="rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
        >
          <ArrowLeft />
        </a>
      </div>
    </div>
  </div>
</header>

<div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-4 px-4 py-3 pt-23">
  <div class="flex items-center gap-x-6 rounded-3xl bg-white p-4">
    <!-- Placeholder for profile picture -->
    <div class="h-10 w-10 rounded-full bg-slate-200"></div>

    <div class="flex flex-col">
      <span class="text-xl font-medium">{data.name}</span>
      <span class="text-slate-500">{data.email}</span>
    </div>
  </div>

  <div class="flex flex-1 flex-col gap-y-4">
    <div class="flex items-center justify-between">
      <span class="text-xl font-semibold">Learning Insights</span>

      <Button
        class="px-4 py-2 text-sm font-medium"
        variant="secondary"
        onclick={handleFrequencyChange}
      >
        {frequency}
      </Button>
    </div>

    <div class="flex flex-col gap-y-3">
      <div class="flex items-center justify-between rounded-3xl bg-white p-4">
        <div class="flex items-center gap-x-2">
          <div class="rounded-full bg-black p-2 text-white">
            <BookOpenCheck class="h-4 w-4" />
          </div>

          <span>No. of MLUs consumed</span>
        </div>

        <div class="flex items-center gap-x-1">
          <span class="text-xl font-medium">
            {frequency === 'Monthly'
              ? data.learningUnitsConsumedByMonth
              : data.learningUnitsConsumedByWeek}
          </span>
          <span class="text-slate-500">MLUs</span>
        </div>
      </div>

      <div class="flex items-center justify-between rounded-3xl bg-white p-4">
        <div class="flex items-center gap-x-2">
          <div class="rounded-full bg-black p-2 text-white">
            <Lightbulb class="h-4 w-4" />
          </div>

          <span>Completed MLUs</span>
        </div>

        <div class="flex items-center gap-x-1">
          <span class="text-xl font-medium">
            {frequency === 'Monthly'
              ? data.learningUnitsCompletedByMonth
              : data.learningUnitsCompletedByWeek}
          </span>
          <span class="text-slate-500">MLUs</span>
        </div>
      </div>
    </div>
  </div>

  <LinkButton href="/logout" data-sveltekit-reload width="full">Log out</LinkButton>
</main>
