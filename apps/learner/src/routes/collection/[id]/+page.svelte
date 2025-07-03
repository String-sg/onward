<script>
  import { ArrowLeft } from '@lucide/svelte';

  import LearningUnit from '$lib/components/LearningUnit.svelte';
</script>

<div class="flex flex-col gap-y-4 px-6 py-5">
  <div class="flex items-center gap-x-3">
    <a class="rounded-full bg-slate-200 px-3 py-4" href="/learning">
      <ArrowLeft />
    </a>
    <span class="text-xl font-medium">SEN peer support</span>
  </div>

  <div class="flex flex-col gap-y-2 rounded-3xl bg-slate-200 p-4">
    <span class="font-semibold text-black">About this topic</span>
    <span class="text-black">
      Explore the world of Special Educational Needs (SEN) peer support that indicates Singapore
      specific peer support knowledges, case studies and more to gain knowledge about SEN. This
      topic encompasses a variety of bite-sized.
    </span>
  </div>

  <div class="flex flex-col gap-y-3">
    <span class="text-xl font-medium">12 podcasts</span>

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
