<script lang="ts">
  import { ArrowLeft, X } from '@lucide/svelte';
  import type { SubmitFunction } from '@sveltejs/kit';
  import { onMount } from 'svelte';

  import { enhance } from '$app/forms';
  import { Badge } from '$lib/components/Badge/index.js';
  import { Button, LinkButton } from '$lib/components/Button/index.js';
  import { Modal } from '$lib/components/Modal/index.js';
  import {
    IsWithinViewport,
    noop,
    trackQuizAttempt,
    trackQuizCompletion,
  } from '$lib/helpers/index.js';
  import { Player } from '$lib/states/index.js';

  const { data, params } = $props();

  let target = $state<HTMLElement | null>(null);
  let currentQuestionAnswerIndex = $state(0);
  let selectedOptionIndex = $state(-1);
  let isFeedbackModalOpen = $state(false);
  let isCompletionModalOpen = $state(false);

  const currentQuestionAnswer = $derived(data.questionAnswers[currentQuestionAnswerIndex]);
  const isCorrectAnswer = $derived(selectedOptionIndex === currentQuestionAnswer.answer);
  const isLastQuestionAnswer = $derived(
    currentQuestionAnswerIndex === data.questionAnswers.length - 1,
  );

  const player = Player.get();
  const isWithinViewport = new IsWithinViewport(() => target);

  onMount(() => {
    player.stop();
  });

  const toggleFeedbackModalVisibility = () => {
    trackQuizAttempt(params.id.toString(), currentQuestionAnswer.id);

    isFeedbackModalOpen = !isFeedbackModalOpen;
  };

  const handleContinueClick = async () => {
    isFeedbackModalOpen = false;

    if (isLastQuestionAnswer) {
      return;
    }

    // Move to next question.
    currentQuestionAnswerIndex++;
    selectedOptionIndex = -1;
  };

  const handleSubmit: SubmitFunction = async () => {
    trackQuizCompletion(params.id.toString());

    isCompletionModalOpen = true;

    return async ({ update }) => {
      await update({ invalidateAll: false });
    };
  };
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-white/90 backdrop-blur-sm">
  <div
    class={[
      'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
      !isWithinViewport.current && '!bg-slate-950/7.5',
    ]}
  ></div>

  <div class="mx-auto flex max-w-5xl items-center justify-between gap-x-3 px-4 py-3">
    <div class="flex items-center gap-x-3">
      <a
        href="/unit/{params.id}"
        class="rounded-full p-4 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
      >
        <ArrowLeft />
      </a>
    </div>
  </div>
</header>

<div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-10 px-4 pt-23 pb-3">
  <div class="flex flex-1 flex-col gap-y-2">
    <Badge variant="slate">
      Question {currentQuestionAnswerIndex + 1} of {data.questionAnswers.length}
    </Badge>

    {#each data.questionAnswers as q, qi (q.id)}
      <div class={['flex flex-col gap-y-4', currentQuestionAnswerIndex !== qi && 'hidden']}>
        <span id="question-{qi}" class="text-xl font-medium">{q.question}</span>

        <div class="flex flex-col gap-y-2" role="radiogroup" aria-labelledby="question-{qi}">
          {#each q.options as o, oi (o)}
            <label
              class={[
                'group flex cursor-pointer items-center gap-x-3 rounded-2xl border border-slate-200 bg-white px-2.5 py-3.5 transition-[border-color,box-shadow] has-focus-visible:outline-dashed',
                'hover:ring-1 hover:ring-slate-200',
                'has-checked:border-slate-950 has-checked:ring-slate-950',
                'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-slate-950 has-focus-visible:outline-dashed',
              ]}
            >
              <input
                type="radio"
                name="question-{qi}"
                value={oi}
                bind:group={selectedOptionIndex}
                class="sr-only"
              />

              <span
                class="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 font-semibold transition-colors group-has-checked:bg-slate-950 group-has-checked:text-white"
              >
                {String.fromCharCode(65 + oi)}
              </span>

              <span class="text-left">{o}</span>
            </label>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <Button
    class="py-3.75"
    width="full"
    disabled={selectedOptionIndex === -1}
    onclick={toggleFeedbackModalVisibility}
  >
    Check Answer
  </Button>
</main>

<Modal isopen={isFeedbackModalOpen} onclose={toggleFeedbackModalVisibility} size="partial">
  <header class="sticky inset-x-0 top-0 bg-white/90 backdrop-blur-sm">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <span class="text-xl font-medium">
        {isCorrectAnswer ? 'Correct answer!' : 'Not quite right!'}
      </span>

      <button
        onclick={toggleFeedbackModalVisibility}
        class="cursor-pointer rounded-full p-3 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
      >
        <X />
      </button>
    </div>
  </header>

  <main class="mx-auto flex min-h-[calc(100%-72px)] max-w-5xl flex-col gap-y-10 px-4 py-3">
    <div class="flex flex-1 flex-col gap-y-4">
      <div class="flex flex-col gap-y-2">
        <span class="font-medium">Your answer</span>

        <div
          class={[
            'flex items-center gap-x-3 rounded-2xl border px-2.5 py-3.5',
            isCorrectAnswer ? 'border-transparent bg-lime-200' : 'border-slate-950 bg-white',
          ]}
        >
          <span
            class={[
              'flex h-8 w-8 items-center justify-center rounded-lg font-semibold',
              isCorrectAnswer ? 'bg-lime-400' : 'bg-slate-950 text-white',
            ]}
          >
            {String.fromCharCode(65 + selectedOptionIndex)}
          </span>

          <span class="text-left">
            {currentQuestionAnswer.options[selectedOptionIndex]}
          </span>
        </div>
      </div>

      {#if !isCorrectAnswer}
        <div class="flex flex-col gap-y-2">
          <span class="font-medium">Correct answer</span>

          <div
            class="flex items-center gap-x-3 rounded-2xl border border-transparent bg-lime-200 px-2.5 py-3.5"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 font-semibold"
            >
              {String.fromCharCode(65 + currentQuestionAnswer.answer)}
            </span>

            <span class="text-left">
              {currentQuestionAnswer.options[currentQuestionAnswer.answer]}
            </span>
          </div>
        </div>
      {/if}

      <div class="flex flex-col gap-y-2 rounded-2xl bg-slate-100 p-3">
        <span class="font-medium text-slate-500">Explanation</span>
        <span>{currentQuestionAnswer.explanation}</span>
      </div>
    </div>

    <form method="POST" action="?/updateLJCompletionStatus" use:enhance={handleSubmit}>
      <input type="hidden" name="csrfToken" value={data.csrfToken} />

      <Button
        class="py-3.75"
        width="full"
        type={isLastQuestionAnswer ? 'submit' : 'button'}
        onclick={handleContinueClick}
      >
        Continue
      </Button>
    </form>
  </main>
</Modal>

<Modal isopen={isCompletionModalOpen} onclose={noop} variant="light">
  <div class="mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center px-4 py-6">
    <div class="flex flex-col items-center justify-center gap-y-1">
      <div class="flex flex-col items-center justify-center gap-y-2">
        <div class="flex flex-col items-center justify-center">
          <span class="text-xl font-medium">Congrats!</span>
          <span class="text-xl font-medium">You have completed</span>
        </div>

        <span class="max-w-xs text-center text-xl font-bold">'{data.learningUnitTitle}'</span>
      </div>
    </div>

    <div class="mt-2.5">
      <enhanced:img
        src="$lib/assets/completion-splash.png?w=644"
        alt="Completion splash"
        class="w-[322px]"
      />

      <div class="flex flex-col gap-y-5">
        <LinkButton href={`/unit/${params.id}`} variant="primary" width="full" class="max-w-sm">
          Done
        </LinkButton>

        <a
          href="/profile"
          class="inline-flex w-full cursor-pointer items-center justify-center rounded-full px-3.75 py-2.75 font-medium hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
        >
          Check my profile
        </a>
      </div>
    </div>
  </div>
</Modal>
