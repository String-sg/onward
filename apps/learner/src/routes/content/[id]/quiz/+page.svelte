<script lang="ts">
  import { ArrowLeft, X } from '@lucide/svelte';

  import { page } from '$app/state';
  import Badge from '$lib/components/Badge.svelte';
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

  let showCompletionModal = $state(false);

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
        isFeedbackModalOpen = false;
        showCompletionModal = true;
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
          !isCorrectAnswer && '!bg-slate-900 !text-white',
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

<div class="flex h-full flex-col gap-y-6 p-6" class:hidden={showCompletionModal}>
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
</div>

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
      <div class="flex flex-col gap-1 rounded-2xl bg-slate-100 p-3">
        <span class="text-base font-medium text-zinc-600">Explanation</span>
        <span class="text-base">{currentQuestion.explanation}</span>
      </div>
    </div>

    <Button onclick={nextQuestion}>Continue</Button>
  </div>
</div>

<div
  class="fixed inset-0 flex h-full justify-center {showCompletionModal ? 'visible' : 'invisible'}"
>
  <div class="absolute inset-0 bg-slate-100"></div>

  <div
    class="z-10 flex h-full w-full flex-col items-center p-6 transition-all {showCompletionModal
      ? 'opacity-100'
      : 'opacity-0'}"
  >
    <div class="flex w-full max-w-5xl flex-1 flex-col">
      <div class="flex flex-1 flex-col items-center justify-center">
        <div class="flex flex-1 flex-col items-center justify-end">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="125"
            height="124"
            viewBox="0 0 125 124"
            fill="none"
          >
            <g opacity="0.5" filter="url(#filter0_f_1284_18262)">
              <path
                d="M33.4863 10C26.9306 19.3485 23.0821 30.7339 23.082 43.0186C23.082 74.8191 48.8638 100.599 80.667 100.599C93.4283 100.599 105.219 96.4468 114.765 89.4219C104.35 104.273 87.1024 113.984 67.585 113.984C35.7819 113.984 10.0002 88.2047 10 56.4043C10 37.364 19.2427 20.4823 33.4863 10Z"
                fill="#D7AFFF"
              />
            </g>
            <path
              d="M33.4863 10C26.9306 19.3485 23.0821 30.7339 23.082 43.0186C23.082 74.8191 48.8638 100.599 80.667 100.599C93.4283 100.599 105.219 96.4468 114.765 89.4219C104.35 104.273 87.1024 113.984 67.585 113.984C35.7819 113.984 10.0002 88.2047 10 56.4043C10 37.364 19.2427 20.4823 33.4863 10Z"
              fill="black"
            />
            <defs>
              <filter
                id="filter0_f_1284_18262"
                x="0"
                y="0"
                width="124.766"
                height="123.984"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="5" result="effect1_foregroundBlur_1284_18262" />
              </filter>
            </defs>
          </svg>
          <span class="text-xl font-medium">+1</span>
        </div>
        <div class="flex flex-1 flex-col items-center justify-center gap-y-4">
          <span class="text-xl font-medium">That was insightful!</span>
          <div class="flex flex-col items-center gap-y-2">
            <span class="text-base">You have earned completion status for</span>
            <Badge variant="purple">Special Educational Needs</Badge>
            <span class="text-base">Track completed topics on your profile.</span>
          </div>
        </div>
      </div>

      <Button href={`/content/${contentId}`}>Done</Button>
    </div>
  </div>
</div>
