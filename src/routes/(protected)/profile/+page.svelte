<script lang="ts">
  import { ArrowLeft, BookOpenCheck, Lightbulb } from '@lucide/svelte';
  import { SvelteDate } from 'svelte/reactivity';

  import { afterNavigate } from '$app/navigation';
  import { IsWithinViewport } from '$lib/helpers/index.js';

  const { data } = $props();

  let target = $state<HTMLElement | null>(null);
  let returnTo = $state('/');
  let selectedPeriod = $state<'W' | 'M' | 'Y' | 'All'>('W');

  const isWithinViewport = new IsWithinViewport(() => target);

  afterNavigate(({ from }) => {
    if (from && (from.url.pathname === '/explore' || from.url.pathname === '/learning')) {
      returnTo = from.url.pathname;
      return;
    }

    returnTo = '/';
  });

  type Period = 'W' | 'M' | 'Y' | 'All';

  const periods: Period[] = ['W', 'M', 'Y', 'All'];

  const handlePeriodChange = (period: Period) => {
    selectedPeriod = period;
  };

  const getDateRange = $derived(() => {
    const end = new SvelteDate();
    let start = new SvelteDate();

    if (selectedPeriod === 'W') {
      start.setDate(data.sevenDaysAgo.getDate());
    } else if (selectedPeriod === 'M') {
      start.setDate(data.thirtyDaysAgo.getDate());
    } else if (selectedPeriod === 'Y') {
      start.setDate(data.oneYearAgo.getDate());
    } else {
      start.setDate(data.firstRecordDate?.getDate() ?? end.getDate());
    }

    return `${start.getDate()} ${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getFullYear()} - ${end.getDate()} ${end.toLocaleDateString('en-US', { month: 'short' })} ${end.getFullYear()}`;
  });
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
          href={returnTo}
          class="rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
        >
          <ArrowLeft />
        </a>
      </div>
      <a
        href="/logout"
        class="rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
        data-sveltekit-reload
      >
        Log out
      </a>
    </div>
  </div>
</header>

<div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-4 px-4 py-3 pt-23">
  <div class="flex items-center gap-x-6 rounded-3xl bg-white p-4">
    <div class="h-10 w-10 overflow-hidden rounded-full">
      <img src={data.avatar} alt="profile" />
    </div>

    <div class="flex flex-col">
      <span class="text-xl font-medium">{data.name}</span>
      <span class="text-slate-500">{data.email}</span>
    </div>
  </div>

  <div class="flex flex-1 flex-col gap-y-4">
    <div class="flex items-center justify-between">
      <span class="text-xl font-semibold">Learning Insights</span>
    </div>

    <div class="flex flex-col gap-y-2">
      <div class="flex items-center justify-between gap-x-2.5 rounded-lg bg-slate-200 p-1">
        {#each periods as period (period)}
          <button
            class={[
              'flex flex-1 cursor-pointer items-center justify-center rounded-md px-3 py-1 text-sm font-medium text-zinc-500 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed',
              selectedPeriod === period && 'pointer-events-none bg-white !text-slate-950',
            ]}
            onclick={() => handlePeriodChange(period)}
          >
            {period}
          </button>
        {/each}
      </div>

      <span class="text-sm text-slate-500">{getDateRange()}</span>
    </div>

    <div class="flex items-center justify-between rounded-3xl bg-white p-4">
      <div class="flex items-center gap-x-2">
        <div class="rounded-full bg-black p-2 text-white">
          <BookOpenCheck class="h-4 w-4" />
        </div>

        <span>Consumed bites</span>
      </div>

      <div class="flex items-center gap-x-1">
        <span class="text-xl font-medium">
          {#if selectedPeriod === 'W'}
            {data.learningUnitsConsumedByWeek}
          {:else if selectedPeriod === 'M'}
            {data.learningUnitsConsumedByMonth}
          {:else if selectedPeriod === 'Y'}
            {data.learningUnitsConsumedByYear}
          {:else}
            {data.learningUnitsConsumedByAll}
          {/if}
        </span>
        <span class="text-slate-500">bites</span>
      </div>
    </div>

    <div class="flex items-center justify-between rounded-3xl bg-white p-4">
      <div class="flex items-center gap-x-2">
        <div class="rounded-full bg-black p-2 text-white">
          <Lightbulb class="h-4 w-4" />
        </div>

        <span>Completed bites</span>
      </div>

      <div class="flex items-center gap-x-1">
        <span class="text-xl font-medium">
          {#if selectedPeriod === 'W'}
            {data.learningUnitsCompletedByWeek}
          {:else if selectedPeriod === 'M'}
            {data.learningUnitsCompletedByMonth}
          {:else if selectedPeriod === 'Y'}
            {data.learningUnitsCompletedByYear}
          {:else}
            {data.learningUnitsCompletedByAll}
          {/if}
        </span>
        <span class="text-slate-500">bites</span>
      </div>
    </div>
  </div>
</main>
