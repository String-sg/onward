<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  import { Collection, type CollectionProps } from '$lib/components/Collection/index.js';
  import { IsWithinViewport } from '$lib/helpers/index.js';

  let target = $state<HTMLElement | null>(null);

  const isWithinViewport = new IsWithinViewport(() => target);
  const { data } = $props();
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
          href="/explore"
          class="rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
        >
          <ArrowLeft />
        </a>
      </div>
    </div>
  </div>
</header>

<div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

<main class="pt-23 relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-6 px-4 pb-28">
  <div class="flex flex-col gap-y-3">
    <div class="px-2">
      <span class="text-xl font-semibold">Learning Topics</span>
    </div>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      {#each data.collections as collection (collection.id)}
        <Collection
          to={collection.to}
          tag={collection.tag}
          title={collection.title}
          numberofpodcasts={collection.numberofpodcasts}
          numberofnotes={collection.numberofnotes}
          type={collection.type as CollectionProps['type']}
        />
      {/each}
    </div>
  </div>
</main>
