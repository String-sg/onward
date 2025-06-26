<script>
  import { ChevronLeft } from '@lucide/svelte';

  import MultiLearningUnitMini from '$lib/components/MultiLearningUnitMini.svelte';
</script>

<div class="flex flex-col px-6">
  <div class="flex flex-col gap-6">
    <div class="flex items-center gap-3">
      <div class="flex h-14 w-12 items-center justify-center rounded-[100px] bg-slate-100">
        <ChevronLeft class="h-6 w-6 text-slate-950" />
      </div>
      <span class="text-xl font-medium text-slate-950">Special Educational Needs</span>
    </div>
    <MultiLearningUnitMini
      to="/mlu/1"
      tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
      title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
    />
  </div>
</div>
