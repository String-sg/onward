<script lang="ts">
  import LearningUnit from '$lib/components/LearningUnit.svelte';
</script>

<div class="flex flex-col gap-y-3">
  <div class="px-2">
    <span class="text-xl font-semibold">Recently learned</span>
  </div>

  <div class="flex flex-col gap-y-4">
    <LearningUnit
      to="/content/1"
      tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
      title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
      showplayerpanel
    />

    <LearningUnit
      to="/content/1"
      tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
      title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
      showplayerpanel
    />
  </div>
</div>
