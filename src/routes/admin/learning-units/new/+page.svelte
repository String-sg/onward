<script lang="ts">
  import { enhance } from '$app/forms';
  import { AddableField } from '$lib/components/AddableField';
  import { Button } from '$lib/components/Button';
  import { Checkbox } from '$lib/components/Checkbox';
  import { DateInput } from '$lib/components/DateInput';
  import { FileInput } from '$lib/components/FileInput';
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

  let sources = $state<{ title: string; sourceURL: string; tagId: string }[]>([
    { title: '', sourceURL: '', tagId: '' },
  ]);

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

  let questions = $state<
    {
      question: string;
      options: [string, string, string, string];
      answer: number;
      explanation: string;
    }[]
  >([
    { question: '', options: ['', '', '', ''], answer: 0, explanation: '' },
    { question: '', options: ['', '', '', ''], answer: 0, explanation: '' },
    { question: '', options: ['', '', '', ''], answer: 0, explanation: '' },
  ]);

  function addSource() {
    sources.push({ title: '', sourceURL: '', tagId: '' });
  }

  function removeSource(index: number) {
    sources.splice(index, 1);
  }

  function addQuestion() {
    questions.push({
      question: '',
      options: ['', '', '', ''],
      answer: 0,
      explanation: '',
    });
  }

  function removeQuestion(index: number) {
    questions.splice(index, 1);
  }
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold">Create Learning Unit</h1>
    <p class="mt-2 text-sm text-slate-600">Add a new learning unit to the system</p>
  </div>

  <form
    method="POST"
    novalidate
    enctype="multipart/form-data"
    use:enhance
    class="flex flex-col gap-6"
  >
    <div class="rounded-lg border border-slate-100 p-6 shadow">
      <div class="flex flex-col gap-4">
        <FormField label="Title" id="title" required error={form?.errors?.title?.message}>
          <TextInput type="text" id="title" name="title" required />
        </FormField>

        <FormField label="Content Type" id="contentType" required>
          <Select id="contentType" name="contentType" required>
            <option value="PODCAST">Podcast</option>
          </Select>
        </FormField>

        <FormField
          label="Podcast File"
          id="podcastFile"
          required
          error={form?.errors?.podcastFile?.message}
        >
          <FileInput id="podcastFile" name="podcastFile" accept="audio/*" required />
        </FormField>

        <FormField
          label="Collection"
          id="collectionId"
          required
          error={form?.errors?.collectionId?.message}
        >
          <Select id="collectionId" name="collectionId" required>
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
          <TextArea id="summary" name="summary" rows={8} />
        </FormField>

        <FormField
          label="Learning Objectives"
          id="objectives"
          required
          error={form?.errors?.objectives?.message}
        >
          <TextArea id="objectives" name="objectives" rows={8} required />
        </FormField>

        <!-- Created By -->
        <FormField
          label="Created By"
          id="createdBy"
          required
          error={form?.errors?.createdBy?.message}
        >
          <TextInput type="text" id="createdBy" name="createdBy" required />
        </FormField>

        <FormField label="Due Date" id="dueDate" error={form?.errors?.dueDate?.message}>
          <DateInput id="dueDate" name="dueDate" min={minDueDate} />
        </FormField>

        <!-- Tags -->
        <FormField label="Tag" id="tags">
          <Select id="tags" name="tags">
            <option value="">Select a tag</option>
            {#each data.tags as tag (tag.id)}
              <option value={tag.id}>{tag.label}</option>
            {/each}
          </Select>
        </FormField>

        <!-- Checkboxes -->
        <div class="flex flex-col gap-2">
          <Checkbox name="isRecommended" label="Recommended" />
          <Checkbox name="isRequired" label="Required" />
        </div>

        <!-- Sources -->
        <AddableField
          class="mt-4 border-t border-slate-200 pt-4"
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
            <FormField label="Source Title" id="source-title-{index}" error={errors?.title}>
              <TextInput type="text" bind:value={source.title} />
            </FormField>

            <FormField label="Source URL" id="source-url-{index}" error={errors?.sourceURL}>
              <TextInput type="url" bind:value={source.sourceURL} placeholder="https://..." />
            </FormField>

            <FormField label="Tag" id="source-tag-{index}">
              <Select bind:value={source.tagId}>
                <option value="">Select a tag (optional)</option>
                {#each data.tags as tag (tag.id)}
                  <option value={tag.id}>{tag.label}</option>
                {/each}
              </Select>
            </FormField>
          {/snippet}
        </AddableField>

        <input type="hidden" name="sources" value={JSON.stringify(sources)} />

        <!-- Questions -->
        <AddableField
          class="mt-4 border-t border-slate-200 pt-4"
          title="Quiz Questions"
          items={questions}
          onadd={addQuestion}
          onremove={removeQuestion}
          addButtonText="Add Question"
          emptyMessage="No questions added yet"
          error={form?.errors?.questions?.message}
          itemErrors={form?.errors?.questions?.items}
        >
          {#snippet children(question, qIndex, errors)}
            <FormField
              label="Question {qIndex + 1}"
              id="question-{qIndex}"
              error={errors?.question}
            >
              <TextArea
                value={question.question}
                oninput={(e) => (question.question = e.currentTarget.value)}
                placeholder="Enter your question"
                rows={2}
              />
            </FormField>

            <FormField label="Options" id="options-{qIndex}" error={errors?.options}>
              <div class="flex flex-col gap-2">
                <TextInput type="text" bind:value={question.options[0]} placeholder="Option 1" />
                <TextInput type="text" bind:value={question.options[1]} placeholder="Option 2" />
                <TextInput type="text" bind:value={question.options[2]} placeholder="Option 3" />
                <TextInput type="text" bind:value={question.options[3]} placeholder="Option 4" />
              </div>
            </FormField>

            <FormField label="Correct Answer" id="answer-{qIndex}" error={errors?.answer}>
              <Select bind:value={question.answer}>
                <option value={0}>Option 1</option>
                <option value={1}>Option 2</option>
                <option value={2}>Option 3</option>
                <option value={3}>Option 4</option>
              </Select>
            </FormField>

            <FormField label="Explanation" id="explanation-{qIndex}" error={errors?.explanation}>
              <TextArea
                value={question.explanation}
                oninput={(e) => (question.explanation = e.currentTarget.value)}
                placeholder="Explanation for the correct answer"
                rows={2}
              />
            </FormField>
          {/snippet}
        </AddableField>

        <input type="hidden" name="questions" value={JSON.stringify(questions)} />
      </div>
    </div>

    <Button class="mx-auto w-full" type="submit">Publish</Button>
  </form>
</div>
