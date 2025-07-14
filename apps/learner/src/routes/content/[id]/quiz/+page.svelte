<script lang="ts">
  import { ArrowLeft, X } from '@lucide/svelte';

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

  let isFeedbackModalOpen = $state(false);

  let isCorrectAnswer = $state(false);

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
        isFeedbackModalOpen = false;
      } else {
        //TODO: Redirect quiz to completion page
        console.log('Quiz completed!');
      }
    }
  }

  function checkAnswer() {
    isCorrectAnswer = selectedOptionIndex + 1 === currentQuestion.answer;
  }

  function showFeedbackModal() {
    isFeedbackModalOpen = true;
  }
</script>

{#snippet modalFeedbackButton(optionIndex: number)}
  <div class="flex flex-col items-start">
    <button
      class={[
        'gap-x-2.75 flex w-full items-center rounded-2xl bg-lime-200 p-3',
        optionIndex !== currentQuestion.answer - 1 && '!bg-slate-100',
      ]}
    >
      <span
        class={[
          'flex items-center justify-center rounded-lg bg-lime-400 px-2 py-1 text-xs font-semibold text-black',
          optionIndex !== currentQuestion.answer - 1 && '!bg-slate-900 !text-white',
        ]}
      >
        {getOptionLetter(optionIndex)}
      </span>
      <span class="text-left text-base">
        {currentQuestion.options[optionIndex]}
      </span>
    </button>
  </div>
{/snippet}

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
          <span class="text-left text-base">
            {option}
          </span>
        </button>
      {/each}
    </div>
  </div>

  <Button
    onclick={() => {
      checkAnswer();
      showFeedbackModal();
    }}
    disabled={selectedOptionIndex === -1 || isFeedbackModalOpen}>Check Answer</Button
  >

  <div
    class="fixed inset-0 flex items-end justify-center {isFeedbackModalOpen
      ? 'visible'
      : 'invisible'}"
  >
    <div
      class="inset-shadow-sm flex max-h-[70vh] w-full max-w-5xl transform flex-col gap-y-5 rounded-t-3xl bg-white p-5 shadow-lg transition-all {isFeedbackModalOpen
        ? 'translate-y-0 opacity-100'
        : 'translate-y-full opacity-0'}"
    >
      <div class="flex items-center justify-between">
        <span class="py-2.5 text-xl/7 font-medium"
          >{isCorrectAnswer ? 'Correct answer!' : 'Not quite right!'}</span
        >
        <button
          class="cursor-pointer rounded-full bg-slate-100 px-2.5 py-3"
          onclick={() => (isFeedbackModalOpen = false)}
        >
          <X />
        </button>
      </div>

      <div class="flex flex-col gap-y-6 overflow-y-auto">
        <div class="flex flex-col gap-y-2">
          <span class="text-base font-medium">Your answer</span>
          {@render modalFeedbackButton(selectedOptionIndex)}
        </div>
        {#if !isCorrectAnswer}
          <div class="flex flex-col gap-y-2">
            <span class="text-base font-medium">Correct answer</span>
            {@render modalFeedbackButton(currentQuestion.answer - 1)}
          </div>
        {/if}
        <div class="flex flex-col gap-y-1 rounded-2xl bg-slate-100 p-3">
          <span class="text-base font-medium text-zinc-600">Explanation</span>
          <span class="text-base">{currentQuestion.explanation}</span>
        </div>
      </div>

      <Button onclick={nextQuestion}>Continue</Button>
    </div>
  </div>
</div>
