<script lang="ts">
  import type { SubmitFunction } from '@sveltejs/kit';

  import { LearningUnitForm } from '$lib/components/LearningUnitForm';

  import type { PageProps } from './$types';

  let { data, form }: PageProps = $props();

  let unit = $state({
    title: '',
    contentType: '',
    contentURL: '',
    collectionId: '',
    summary: '',
    objectives: '',
    createdBy: '',
    selectedTagId: '',
    isRecommended: false,
    isRequired: false,
    dueDate: '',
    sources: [],
    questionAnswers: [],
  });

  const handleFormSubmit: SubmitFunction =
    () =>
    async ({ update }) => {
      await update({ reset: false });
    };
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <div class="mb-6 flex flex-col gap-1">
    <span class="text-xl font-medium">Create Learning Unit</span>
    <span class="text-xs text-slate-500">Fill in the details for the new learning unit</span>
  </div>

  <LearningUnitForm bind:unit {data} {form} onsubmit={handleFormSubmit} />
</div>
