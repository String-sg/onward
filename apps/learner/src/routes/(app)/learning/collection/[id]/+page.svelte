<script>
  import { ChevronLeft } from '@lucide/svelte';

  import MultiLearningUnitMini from '$lib/components/MultiLearningUnitMini.svelte';
</script>

<div class="flex flex-col gap-y-6 px-6">
  <div class="flex items-center gap-x-3">
    <a
      href="/learning"
      class="flex items-center justify-center rounded-full bg-slate-100 px-2 py-3"
    >
      <ChevronLeft />
    </a>
    <span class="text-xl font-medium">SEN peer support</span>
  </div>

  <div class="flex flex-col gap-3">
    <span class="text-xl font-medium">12 podcasts</span>

    <MultiLearningUnitMini
      to="/content/1"
      tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
      title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
    />

    <MultiLearningUnitMini
      to="/content/1"
      tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
      title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
    />
  </div>
</div>
