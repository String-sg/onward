<script lang="ts">
  import type { SubmitFunction } from '@sveltejs/kit';
  import { untrack } from 'svelte';

  import type { UnitState } from '$lib/components/LearningUnitForm';
  import { LearningUnitForm } from '$lib/components/LearningUnitForm';

  import type { ActionData, PageProps } from './$types';

  let { data, form }: PageProps = $props();

  let unit: UnitState = $state(
    untrack(() => {
      return {
        title: data.learningUnit.title ?? '',
        contentType: data.learningUnit.contentType ?? '',
        contentURL: data.learningUnit.contentURL ?? '',
        collectionId: data.learningUnit.collectionId ?? '',
        summary: data.learningUnit.summary ?? '',
        objectives: data.learningUnit.objectives ?? '',
        createdBy: data.learningUnit.createdBy ?? '',
        selectedTagId: data.learningUnit.tags[0]?.tagId ?? '',
        isRecommended: data.learningUnit.isRecommended,
        isRequired: data.learningUnit.isRequired,
        dueDate: data.learningUnit.dueDate ?? '',
        sources: data.learningUnit.sources,
        questionAnswers:
          data.learningUnit.questionAnswers.length > 0 ? data.learningUnit.questionAnswers : [],
      };
    }),
  );

  const handleFormSubmit: SubmitFunction =
    () =>
    async ({ result, update, action }) => {
      if (action.search === '?/saveDraft' && result.type === 'success') {
        const data = result.data as ActionData;
        if (!data) {
          return;
        }

        const savedLU = data.learningUnit;
        if (savedLU) {
          unit = {
            title: savedLU.title ?? '',
            contentType: savedLU.contentType ?? '',
            contentURL: savedLU.contentURL ?? '',
            collectionId: savedLU.collectionId ?? '',
            summary: savedLU.summary ?? '',
            objectives: savedLU.objectives ?? '',
            createdBy: savedLU.createdBy ?? '',
            selectedTagId: savedLU.tags[0]?.tagId ?? '',
            isRecommended: savedLU.isRecommended,
            isRequired: savedLU.isRequired,
            dueDate: savedLU.dueDate ?? '',
            sources: savedLU.sources,
            questionAnswers: savedLU.questionAnswers.length > 0 ? savedLU.questionAnswers : [],
          };
        }
        await update({ invalidateAll: false, reset: false });
      } else {
        await update({ reset: false });
      }
    };
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <div class="mb-6 flex flex-col gap-1">
    <div class="flex items-center justify-between">
      <span class="text-xl font-medium">Edit Learning Unit</span>
      <span
        class="rounded-full px-3 py-1 text-xs font-medium"
        class:bg-slate-100={data.learningUnit.status === 'DRAFT'}
        class:bg-emerald-100={data.learningUnit.status === 'PUBLISHED'}
        class:text-slate-700={data.learningUnit.status === 'DRAFT'}
        class:text-emerald-700={data.learningUnit.status === 'PUBLISHED'}
      >
        {data.learningUnit.status}
      </span>
    </div>
    <span class="text-xs text-slate-500">Edit learning unit details</span>
  </div>

  <LearningUnitForm bind:unit {data} {form} onsubmit={handleFormSubmit} />
</div>
