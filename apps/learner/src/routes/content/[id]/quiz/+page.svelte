<script lang="ts">
  import { ArrowLeft, X } from '@lucide/svelte';
  import { slide } from 'svelte/transition';

  import { base } from '$app/paths';
  import { page } from '$app/state';
  import { Badge } from '$lib/components/Badge/index.js';
  import { Button, LinkButton } from '$lib/components/Button/index.js';
  import Progress from '$lib/components/Progress.svelte';
  import { Starfield } from '$lib/components/Starfield';
  import { useIsWithinViewport } from '$lib/helpers/index.js';

  const { data } = $props();

  let selectedOptionIndex = $state(-1);
  let currentQuestionIndex = $state(0);
  let isFeedbackModalOpen = $state(false);
  let isCorrectAnswer = $state(false);
  let isCompletionModalOpen = $state(false);
  let target = $state<HTMLElement | null>(null);

  let currentQuestion = $derived(data.questionAnswers[currentQuestionIndex]);
  let percentageCompleted = $derived(
    ((currentQuestionIndex + 1) / data.questionAnswers.length) * 100,
  );
  let contentId = $derived(page.params.id);

  const isWithinViewport = useIsWithinViewport(() => target);

  const selectOption = (index: number) => {
    selectedOptionIndex = index;
  };

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index);
  };

  const nextQuestion = () => {
    if (selectedOptionIndex !== -1) {
      if (currentQuestionIndex < data.questionAnswers.length - 1) {
        currentQuestionIndex++;
        selectedOptionIndex = -1;
        isFeedbackModalOpen = false;
      } else {
        isFeedbackModalOpen = false;
        isCompletionModalOpen = true;
      }
    }
  };

  const handleCheckAnswer = () => {
    isCorrectAnswer = selectedOptionIndex + 1 === currentQuestion.answer;
    isFeedbackModalOpen = true;
  };

  const closeFeedbackModal = () => {
    isFeedbackModalOpen = false;
  };
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-slate-100/90 backdrop-blur-sm">
  <div
    class={[
      'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
      !isWithinViewport.current && '!bg-slate-950/7.5',
    ]}
  ></div>

  <div class="mx-auto flex w-full max-w-5xl items-center justify-between gap-x-3 px-4 py-3">
    <a href="/content/{contentId}" class="rounded-full p-4 transition-colors hover:bg-slate-200">
      <ArrowLeft />
    </a>

    <Progress value={percentageCompleted} />
  </div>
</header>

<main class="pt-23 pb-23 relative mx-auto min-h-full w-full max-w-5xl px-4">
  <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

  <div class="flex h-full flex-col">
    <div class="flex flex-1 flex-col gap-y-6 overflow-y-auto">
      <div class="flex flex-col gap-y-2">
        <Badge variant="slate">
          Question {currentQuestionIndex + 1} of {data.questionAnswers.length}
        </Badge>

        <span class="text-xl font-medium">{currentQuestion.question}</span>
      </div>

      <div class="flex flex-col gap-y-2 px-1">
        {#each currentQuestion.options as option, index (option)}
          <button
            class={[
              'py-3.75 px-2.75 shadow-xs group flex cursor-pointer items-center gap-x-3 rounded-2xl border border-transparent bg-white transition-all hover:bg-slate-50 hover:shadow-sm',
              selectedOptionIndex === index && '!border-slate-950',
            ]}
            onclick={() => selectOption(index)}
          >
            <span
              class={[
                'rounded-lg bg-slate-100 px-2.5 py-1 font-semibold transition-colors group-hover:bg-slate-200',
                selectedOptionIndex === index && '!bg-slate-950 !text-white',
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
      width="full"
      disabled={selectedOptionIndex === -1 || isFeedbackModalOpen}
      onclick={handleCheckAnswer}
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
          class="cursor-pointer rounded-full p-4 hover:bg-slate-100"
          onclick={closeFeedbackModal}
        >
          <X />
        </button>
      </div>

      <div class="flex flex-col gap-y-6 overflow-y-auto">
        <div class="flex flex-col gap-y-2">
          <span class="font-medium">Your answer</span>
          <div
            class={[
              'py-3.75 px-2.75 flex w-full items-center gap-x-3 rounded-2xl border border-transparent bg-lime-200',
              selectedOptionIndex !== currentQuestion.answer - 1 && '!border-slate-950 !bg-white',
            ]}
          >
            <span
              class={[
                'rounded-lg bg-lime-400 px-2.5 py-1 font-semibold',
                selectedOptionIndex !== currentQuestion.answer - 1 && '!bg-slate-950 !text-white',
              ]}
            >
              {getOptionLetter(selectedOptionIndex)}
            </span>

            <span class="text-left">
              {currentQuestion.options[selectedOptionIndex]}
            </span>
          </div>
        </div>

        {#if !isCorrectAnswer}
          <div class="flex flex-col gap-y-2">
            <span class="font-medium">Correct answer</span>
            <div
              class="py-3.75 px-2.75 flex w-full items-center gap-x-3 rounded-2xl border border-transparent bg-lime-200"
            >
              <span class="rounded-lg bg-lime-400 px-2.5 py-1 font-semibold">
                {getOptionLetter(currentQuestion.answer - 1)}
              </span>

              <span class="text-left">
                {currentQuestion.options[currentQuestion.answer - 1]}
              </span>
            </div>
          </div>
        {/if}
        <div class="flex flex-col gap-y-1 rounded-2xl bg-slate-100 p-3">
          <span class="font-medium text-zinc-600">Explanation</span>

          <span>{currentQuestion.explanation}</span>
        </div>
      </div>

      <Button width="full" onclick={nextQuestion}>Continue</Button>
    </div>
  </div>
{/if}

{#if isCompletionModalOpen}
  <div class="z-100 fixed inset-0 flex items-center justify-center bg-slate-950">
    <Starfield />
    <div class="flex h-full w-full max-w-5xl flex-col px-4 py-3 transition-all">
      <div class="flex flex-1 flex-col items-center justify-center">
        <!-- TODO: placeholder image, to be replaced once confirmed -->
        <img
          sizes="(max-width: 1023px) 256px, 384px"
          srcset={`${base}/meteor/256w.webp 256w, ${base}/meteor/384w.webp 384w`}
          src={`${base}/meteor/256w.webp`}
          alt="meteor logo"
        />
      </div>

      <div class="flex flex-auto flex-col justify-center gap-y-4 text-center text-white">
        <span class="text-xl font-medium">That was insightful!</span>
        <div class="flex flex-col gap-y-2">
          <span>You have earned completion status for</span>
          <span>Special Educational Needs</span>
          <span>Track completed topics on your profile.</span>
        </div>
      </div>

      <LinkButton href={`/content/${contentId}`} variant="secondary" width="full">Done</LinkButton>
    </div>
  </div>
{/if}
