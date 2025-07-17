<script lang="ts">
  import { ArrowLeft, X } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';

  import { page } from '$app/state';
  import { Button } from '$lib/components/Button/index.js';
  import Progress from '$lib/components/Progress.svelte';

  const { data } = $props();

  let selectedOptionIndex = $state(-1);
  let currentQuestionIndex = $state(0);
  let isFeedbackModalOpen = $state(false);
  let isCorrectAnswer = $state(false);
  let isWithinViewport = $state(false);

  let target: HTMLElement | null;
  let currentQuestion = $derived(data.questionAnswers[currentQuestionIndex]);
  let percentageCompleted = $derived(
    ((currentQuestionIndex + 1) / data.questionAnswers.length) * 100,
  );
  let contentId = $derived(page.params.id);

  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => {
      isWithinViewport = entry.isIntersecting;
    });

    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  });

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

  function handleCheckAnswer() {
    isCorrectAnswer = selectedOptionIndex + 1 === currentQuestion.answer;
    isFeedbackModalOpen = true;
  }

  function closeFeedbackModal() {
    isFeedbackModalOpen = false;
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
          'rounded-lg bg-lime-400 px-2 py-1 text-xs font-semibold',
          optionIndex !== currentQuestion.answer - 1 && '!bg-slate-900 !text-white',
        ]}
      >
        {getOptionLetter(optionIndex)}
      </span>

      <span class="text-left">
        {currentQuestion.options[optionIndex]}
      </span>
    </button>
  </div>
{/snippet}

<header class="fixed inset-x-0 top-0 z-50 bg-slate-100/90 backdrop-blur-sm">
  <div
    class={[
      'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
      !isWithinViewport && '!bg-slate-950/7.5',
    ]}
  ></div>

  <div class="mx-auto w-full max-w-5xl px-4 py-3">
    <div class="flex items-center justify-between gap-x-8">
      <div class="flex w-full items-center gap-x-3">
        <a
          href="/content/{contentId}"
          class="rounded-full p-4 transition-colors hover:bg-slate-200"
        >
          <ArrowLeft />
        </a>

        <Progress value={percentageCompleted} />

        <span class="text-sm">{currentQuestionIndex + 1}/{data.questionAnswers.length}</span>
      </div>
    </div>
  </div>
</header>

<main class="pt-23 pb-23 relative mx-auto min-h-full w-full max-w-5xl px-4">
  <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

  <div class="flex h-full flex-col">
    <div class="flex flex-1 flex-col gap-y-6 overflow-y-auto">
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
                'rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold',
                selectedOptionIndex === index && '!bg-slate-900 !text-white',
              ]}
            >
              {getOptionLetter(index)}
            </span>

            <span class="text-left">
              {option}
            </span>
          </button>
        {/each}
      </div>
    </div>
  </div>
</main>

<div class="fixed inset-x-0 bottom-0 z-50 bg-slate-100/90 backdrop-blur-sm">
  <div class="mx-auto w-full max-w-5xl px-4 py-3">
    <Button
      onclick={handleCheckAnswer}
      disabled={selectedOptionIndex === -1 || isFeedbackModalOpen}
    >
      Check Answer
    </Button>
  </div>
</div>

{#if isFeedbackModalOpen}
  <div class="z-100 fixed inset-0 flex items-end justify-center">
    <div
      class="inset-shadow-sm flex max-h-[70vh] w-full max-w-5xl transform flex-col gap-y-5 rounded-t-3xl bg-white px-4 py-3 shadow-lg transition-all"
      transition:slide={{ axis: 'y' }}
    >
      <div class="flex items-center justify-between">
        <span class="py-2.5 text-xl font-medium">
          {isCorrectAnswer ? 'Correct answer!' : 'Not quite right!'}
        </span>
        <button
          class="cursor-pointer rounded-full bg-slate-100 px-2.5 py-3 hover:bg-slate-200"
          onclick={closeFeedbackModal}
        >
          <X />
        </button>
      </div>

      <div class="flex flex-col gap-y-6 overflow-y-auto">
        <div class="flex flex-col gap-y-2">
          <span class="font-medium">Your answer</span>
          {@render modalFeedbackButton(selectedOptionIndex)}
        </div>
        {#if !isCorrectAnswer}
          <div class="flex flex-col gap-y-2">
            <span class="font-medium">Correct answer</span>
            {@render modalFeedbackButton(currentQuestion.answer - 1)}
          </div>
        {/if}
        <div class="flex flex-col gap-y-1 rounded-2xl bg-slate-100 p-3">
          <span class="font-medium text-zinc-600">Explanation</span>
          <span>{currentQuestion.explanation}</span>
        </div>
      </div>

      <Button onclick={nextQuestion}>Continue</Button>
    </div>
  </div>
{/if}
