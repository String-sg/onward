<script lang="ts">
  import { untrack } from 'svelte';

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

  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDueDate = tomorrow.toISOString().split('T')[0];

  // Pre-populate sources from loaded data
  let sources = $state<{ title: string; sourceURL: string; tagId: string }[]>(
    untrack(() =>
      data.learningUnit.sources.length > 0
        ? data.learningUnit.sources.map((s) => ({
            title: s.title,
            sourceURL: s.sourceURL,
            tagId: s.tags[0]?.tagId || '',
          }))
        : [],
    ),
  );

  // Pre-populate question answers from loaded data
  let questionAnswers = $state<
    {
      question: string;
      options: string[];
      answer: number;
      explanation: string;
    }[]
  >(
    untrack(() =>
      data.learningUnit.questionAnswers.length > 0
        ? data.learningUnit.questionAnswers.map((q) => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation,
          }))
        : [{ question: '', options: ['', ''], answer: 0, explanation: '' }],
    ),
  );

  let isRecommended = $state(untrack(() => data.learningUnit.isRecommended));
  let isRequired = $state(untrack(() => data.learningUnit.isRequired));
  let dueDate = $state(
    untrack(() =>
      data.learningUnit.dueDate
        ? new Date(data.learningUnit.dueDate).toISOString().split('T')[0]
        : '',
    ),
  );

  // Selected tag IDs from loaded data
  let selectedTagIds = $state<string[]>(untrack(() => data.learningUnit.tags.map((t) => t.tagId)));

  $effect(() => {
    if (!isRequired) {
      dueDate = '';
    }
  });

  $effect(() => {
    if (form?.errors) {
      const firstErrorField = Object.keys(form.errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element?.focus();
      }
    }
  });

  const addSource = () => {
    sources.push({ title: '', sourceURL: '', tagId: '' });
  };

  const removeSource = (index: number) => {
    sources.splice(index, 1);
  };

  const addQuestion = () => {
    questionAnswers.push({
      question: '',
      options: ['', ''],
      answer: 0,
      explanation: '',
    });
  };

  const removeQuestion = (index: number) => {
    questionAnswers.splice(index, 1);
  };

  const addOption = (questionAnswerIndex: number) => {
    questionAnswers[questionAnswerIndex].options.push('');
  };

  const removeOption = (questionAnswerIndex: number, optionIndex: number) => {
    const question = questionAnswers[questionAnswerIndex];
    question.options.splice(optionIndex, 1);

    if (question.answer >= question.options.length) {
      question.answer = Math.max(0, question.options.length - 1);
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

  <form method="POST" novalidate use:enhance class="flex flex-col gap-6">
    <div class="rounded-lg border border-slate-100 p-6 shadow">
      <div class="flex flex-col gap-4">
        <FormField label="Title" id="title" required error={form?.errors?.title?.message}>
          <TextInput type="text" id="title" name="title" value={data.learningUnit.title} />
        </FormField>

        <FormField label="Content Type" id="contentType" required>
          <Select id="contentType" name="contentType" value={data.learningUnit.contentType}>
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
            value={data.learningUnit.contentURL}
          />
        </FormField>

        <FormField
          label="Collection"
          id="collectionId"
          required
          error={form?.errors?.collectionId?.message}
        >
          <Select id="collectionId" name="collectionId" value={data.learningUnit.collectionId}>
            <option value="">Select a collection</option>
            {#each data.collections as collection (collection.id)}
              <option value={collection.id}>
                {collection.title} ({collection.type})
              </option>
            {/each}
          </Select>
        </FormField>

        <!-- Use Transcript as the label because DB column is uses summary -->
        <FormField id="summary" label="Transcript" required error={form?.errors?.summary?.message}>
          <TextArea id="summary" name="summary" value={data.learningUnit.summary} />
        </FormField>

        <FormField
          label="Learning Objectives"
          id="objectives"
          required
          error={form?.errors?.objectives?.message}
        >
          <TextArea id="objectives" name="objectives" value={data.learningUnit.objectives} />
        </FormField>

        <FormField
          label="Created By"
          id="createdBy"
          required
          error={form?.errors?.createdBy?.message}
        >
          <TextInput
            type="text"
            id="createdBy"
            name="createdBy"
            value={data.learningUnit.createdBy}
          />
        </FormField>

        <FormField label="Tag" id="tags" required error={form?.errors?.tags?.message}>
          <Select id="tags" name="tags" value={selectedTagIds[0] || ''}>
            <option value="">Select a tag</option>
            {#each data.contentTags as tag (tag.id)}
              <option value={tag.id}>{tag.label}</option>
            {/each}
          </Select>
        </FormField>

        <Checkbox
          bind:checked={isRecommended}
          name="isRecommended"
          label="Recommended"
          error={form?.errors?.isRecommended?.message}
        />

        <Checkbox
          bind:checked={isRequired}
          name="isRequired"
          label="Required"
          error={form?.errors?.isRequired?.message}
        />

        {#if isRequired}
          <FormField label="Due Date" id="dueDate" required error={form?.errors?.dueDate?.message}>
            <DateInput id="dueDate" name="dueDate" bind:value={dueDate} min={minDueDate} />
          </FormField>
        {/if}

        <!-- Sources -->
        <AddableField
          title="Sources"
          items={sources}
          onadd={addSource}
          onremove={removeSource}
          addButtonText="Add Source"
          emptyMessage="No sources added yet"
          error={form?.errors?.sources?.message}
          itemErrors={form?.errors?.sources?.items}
        >
          {#snippet children(source, index, errors)}
            <FormField
              label="Source Title"
              id="source-title-{index}"
              required
              error={errors?.title}
            >
              <TextInput type="text" bind:value={source.title} />
            </FormField>

            <FormField
              label="Source URL"
              id="source-url-{index}"
              required
              error={errors?.sourceURL}
            >
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

        <input type="hidden" name="sources" value={JSON.stringify(sources)} />

        <!-- Questions -->
        <AddableField
          title="Quiz Questions"
          items={questionAnswers}
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

        <input type="hidden" name="questionAnswers" value={JSON.stringify(questionAnswers)} />
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
