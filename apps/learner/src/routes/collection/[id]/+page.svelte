<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  import LearningUnit from '$lib/components/LearningUnit.svelte';
  import { IsWithinViewport } from '$lib/helpers';

  let target = $state<HTMLElement | null>(null);

  const isWithinViewport = new IsWithinViewport(() => target);
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-slate-100/90 backdrop-blur-sm">
  <div
    class={[
      'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
      target && !isWithinViewport.current && '!bg-slate-950/7.5',
    ]}
  ></div>

  <div class="mx-auto w-full max-w-5xl px-4 py-3">
    <div class="flex items-center justify-between gap-x-8">
      <div class="flex items-center gap-x-3">
        <a href="/learning" class="rounded-full px-3 py-4 transition-colors hover:bg-slate-200">
          <ArrowLeft />
        </a>

        <span class="text-xl font-medium">SEN peer support</span>
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
        Explore the world of Special Educational Needs (SEN) peer support that indicates Singapore
        specific peer support knowledges, case studies and more to gain knowledge about SEN. This
        topic encompasses a variety of bite-sized.
      </span>
    </div>

    <div class="flex flex-col gap-y-3">
      <div class="px-2">
        <span class="text-xl font-semibold">12 podcasts</span>
      </div>

      <div class="flex flex-col gap-y-4">
        <LearningUnit
          to="/content/1"
          tags={[
            { variant: 'purple', content: 'Special Educational Needs' },
            { variant: 'slate', content: 'Podcast' },
          ]}
          title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
        />

        <LearningUnit
          to="/content/1"
          tags={[
            { variant: 'purple', content: 'Special Educational Needs' },
            { variant: 'slate', content: 'Podcast' },
          ]}
          title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
        />

        <LearningUnit
          to="/content/1"
          tags={[
            { variant: 'purple', content: 'Special Educational Needs' },
            { variant: 'slate', content: 'Podcast' },
          ]}
          title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
        />
      </div>
    </div>
  </div>
</main>
