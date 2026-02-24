<script lang="ts">
  import type { SubmitFunction } from '@sveltejs/kit';

  import { enhance } from '$app/forms';
  import { AddableField } from '$lib/components/AddableField';
  import { Button } from '$lib/components/Button';
  import { Checkbox } from '$lib/components/Checkbox';
  import { DateInput } from '$lib/components/DateInput';
  import { FormField } from '$lib/components/FormField';
  import { Select } from '$lib/components/Select';
  import { TextArea } from '$lib/components/TextArea';
  import { TextInput } from '$lib/components/TextInput';

  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const minDueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
    sources: [] as { title: string; sourceURL: string; tagId: string }[],
    questionAnswers: [{ question: '', options: ['', ''], answer: 0, explanation: '' }] as {
      question: string;
      options: string[];
      answer: number;
      explanation: string;
    }[],
  });

  $effect(() => {
    if (form && form.errors) {
      const firstErrorField = Object.keys(form.errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (!element) {
          return;
        }
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
    }
  });

  const addSource = () => {
    unit.sources.push({ title: '', sourceURL: '', tagId: '' });
  };

  const removeSource = (index: number) => {
    unit.sources.splice(index, 1);
  };

  const addQuestion = () => {
    unit.questionAnswers.push({ question: '', options: ['', ''], answer: 0, explanation: '' });
  };

  const removeQuestion = (index: number) => {
    unit.questionAnswers.splice(index, 1);
  };

  const addOption = (questionIndex: number) => {
    unit.questionAnswers[questionIndex].options.push('');
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const q = unit.questionAnswers[questionIndex];
    q.options.splice(optionIndex, 1);
    if (q.answer >= q.options.length) {
      q.answer = Math.max(0, q.options.length - 1);
    }
  };

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

  <form method="POST" novalidate use:enhance={handleFormSubmit} class="flex flex-col gap-6">
    <div class="rounded-lg border border-slate-100 p-6 shadow">
      <div class="flex flex-col gap-4">
        <FormField label="Title" id="title" required error={form?.errors?.title?.message}>
          <TextInput type="text" id="title" name="title" bind:value={unit.title} />
        </FormField>

        <FormField
          label="Content Type"
          id="contentType"
          required
          error={form?.errors?.contentType?.message}
        >
          <Select id="contentType" name="contentType" bind:value={unit.contentType}>
            <option value="">Select a content type</option>
            <option value="PODCAST">Podcast</option>
          </Select>
        </FormField>

        <FormField
          label="Content URL"
          id="contentURL"
          required
          error={form?.errors?.contentURL?.message}
        >
          <TextInput
            type="url"
            id="contentURL"
            name="contentURL"
            placeholder="https://..."
            bind:value={unit.contentURL}
          />
        </FormField>

        <FormField
          label="Collection"
          id="collectionId"
          required
          error={form?.errors?.collectionId?.message}
        >
          <Select id="collectionId" name="collectionId" bind:value={unit.collectionId}>
            <option value="">Select a collection</option>
            {#each data.collections as collection (collection.id)}
              <option value={collection.id}>
                {collection.title} ({collection.type})
              </option>
            {/each}
          </Select>
        </FormField>

        <!-- Use Transcript as the label because DB column uses summary -->
        <FormField id="summary" label="Transcript" required error={form?.errors?.summary?.message}>
          <TextArea id="summary" name="summary" bind:value={unit.summary} />
        </FormField>

        <FormField
          label="Learning Objectives"
          id="objectives"
          required
          error={form?.errors?.objectives?.message}
        >
          <TextArea id="objectives" name="objectives" bind:value={unit.objectives} />
        </FormField>

        <FormField
          label="Created By"
          id="createdBy"
          required
          error={form?.errors?.createdBy?.message}
        >
          <TextInput type="text" id="createdBy" name="createdBy" bind:value={unit.createdBy} />
        </FormField>

        <FormField label="Tag" id="tags" required error={form?.errors?.tags?.message}>
          <Select id="tags" name="tags" bind:value={unit.selectedTagId}>
            <option value="">Select a tag</option>
            {#each data.contentTags as tag (tag.id)}
              <option value={tag.id}>{tag.label}</option>
            {/each}
          </Select>
        </FormField>

        <Checkbox
          bind:checked={unit.isRecommended}
          name="isRecommended"
          label="Recommended"
          error={form?.errors?.isRecommended?.message}
        />

        <Checkbox
          bind:checked={unit.isRequired}
          name="isRequired"
          label="Required"
          error={form?.errors?.isRequired?.message}
        />

        {#if unit.isRequired}
          <FormField label="Due Date" id="dueDate" required error={form?.errors?.dueDate?.message}>
            <DateInput id="dueDate" name="dueDate" bind:value={unit.dueDate} min={minDueDate} />
          </FormField>
        {/if}

        <!-- Sources -->
        <AddableField
          title="Sources"
          items={unit.sources}
          onadd={addSource}
          onremove={removeSource}
          addButtonText="Add Source"
          emptyMessage="No sources added yet"
          error={form?.errors?.sources?.message}
          itemErrors={form?.errors?.sources?.items}
        >
          {#snippet children(source, index, errors)}
            <FormField label="Source Title" id="source-title-{index}" error={errors?.title}>
              <TextInput type="text" bind:value={source.title} />
            </FormField>

            <FormField label="Source URL" id="source-url-{index}" error={errors?.sourceURL}>
              <TextInput type="url" bind:value={source.sourceURL} placeholder="https://..." />
            </FormField>

            <FormField label="Tag" id="source-tag-{index}">
              <Select bind:value={source.tagId}>
                <option value="">Select a tag (optional)</option>
                {#each data.sourceTags as tag (tag.id)}
                  <option value={tag.id}>{tag.label}</option>
                {/each}
              </Select>
            </FormField>
          {/snippet}
        </AddableField>

        <input type="hidden" name="sources" value={JSON.stringify(unit.sources)} />

        <!-- Questions -->
        <AddableField
          title="Quiz Questions"
          items={unit.questionAnswers}
          onadd={addQuestion}
          onremove={removeQuestion}
          addButtonText="Add Question"
          emptyMessage="No questions added yet"
          error={form?.errors?.questionAnswers?.message}
          itemErrors={form?.errors?.questionAnswers?.items}
        >
          {#snippet children(questionAnswer, index, errors)}
            <FormField label="Question {index + 1}" id="question-{index}" error={errors?.question}>
              <TextInput
                type="text"
                bind:value={questionAnswer.question}
                placeholder="Enter your question"
              />
            </FormField>

            <AddableField
              title="Options"
              items={questionAnswer.options}
              onadd={() => addOption(index)}
              onremove={(optIndex) => removeOption(index, optIndex)}
              addButtonText="Add Option"
              emptyMessage="No options added yet"
              error={errors?.options}
            >
              {#snippet children(_option, optIndex)}
                <FormField label="Option {optIndex + 1}" id="option-{index}-{optIndex}">
                  <TextInput type="text" bind:value={questionAnswer.options[optIndex]} />
                </FormField>
              {/snippet}
            </AddableField>

            <FormField label="Correct Answer" id="answer-{index}" error={errors?.answer}>
              <Select bind:value={questionAnswer.answer}>
                {#each questionAnswer.options as option, optIndex (optIndex)}
                  <option value={optIndex}>
                    {option || `Option ${optIndex + 1}`}
                  </option>
                {/each}
              </Select>
            </FormField>

            <FormField label="Explanation" id="explanation-{index}" error={errors?.explanation}>
              <TextArea
                bind:value={questionAnswer.explanation}
                placeholder="Explanation for the correct answer"
              />
            </FormField>
          {/snippet}
        </AddableField>

        <input type="hidden" name="questionAnswers" value={JSON.stringify(unit.questionAnswers)} />
      </div>
    </div>

    <div class="flex justify-end gap-4">
      <Button type="submit" formaction="?/publish" variant="primary" class="px-6">Publish</Button>
      <Button type="submit" formaction="?/saveDraft" variant="secondary" class="px-6">
        Save Draft
      </Button>
    </div>
  </form>
</div>
