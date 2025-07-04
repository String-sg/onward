<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  import { page } from '$app/state';
  import Button from '$lib/components/Button.svelte';
  import Progress from '$lib/components/Progress.svelte';

  const { data } = $props();

  let selectedOptionIndex = $state(-1);
  let currentQuestionIndex = $state(0);

  let currentQuestion = $derived(data.questionAnswers[currentQuestionIndex]);

  let percentageCompleted = $derived(
    ((currentQuestionIndex + 1) / data.questionAnswers.length) * 100,
  );

  const contentId = $derived(page.params.id);

  function selectOption(index: number) {
    selectedOptionIndex = index;
  }

  function getOptionLetter(index: number) {
    return String.fromCharCode(65 + index);
  }

  function nextQuestion() {
    if (selectedOptionIndex !== -1) {
      if (currentQuestionIndex < data.questionAnswers.length - 1) {
        currentQuestionIndex++;
        selectedOptionIndex = -1;
      } else {
        //TODO: Redirect quiz to completion page
        console.log('Quiz completed!');
      }
    }
  }
</script>

<div class="flex h-full flex-col gap-y-6 p-6">
  <div class="flex items-center gap-x-8">
    <a class="rounded-full bg-slate-200 px-3 py-4" href="/content/{contentId}">
      <ArrowLeft />
    </a>
    <Progress value={percentageCompleted} />
    <span class="text-sm">{currentQuestionIndex + 1}/{data.questionAnswers.length}</span>
  </div>

  <div class="flex flex-1 flex-col gap-y-6">
    <span class="text-xl font-medium">{currentQuestion.question}</span>
    <div class="flex flex-col items-start gap-y-2">
      {#each currentQuestion.options as option, index (option)}
        <button
          class={[
            'py-4.75 px-2.75 flex w-full cursor-pointer items-center gap-x-3 rounded-2xl border border-transparent bg-white',
            selectedOptionIndex === index && '!border-black',
          ]}
          onclick={() => selectOption(index)}
        >
          <span
            class={[
              'flex items-center justify-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-black',
              selectedOptionIndex === index && '!bg-slate-900 !text-white',
            ]}
          >
            {getOptionLetter(index)}
          </span>
          <span class="text-left text-sm">
            {option}
          </span>
        </button>
      {/each}
    </div>
  </div>

  <Button onclick={nextQuestion} disabled={selectedOptionIndex === -1}>Check Answer</Button>
</div>
