<script lang="ts">
  import { ArrowLeft, X } from '@lucide/svelte';
  import { onMount } from 'svelte';

  import { Badge } from '$lib/components/Badge/index.js';
  import { Button, LinkButton } from '$lib/components/Button/index.js';
  import { Modal } from '$lib/components/Modal/index.js';
  import { Starfield } from '$lib/components/Starfield/index.js';
  import { IsWithinViewport, noop, tagCodeToBadgeVariant } from '$lib/helpers/index.js';
  import { Player } from '$lib/states/index.js';

  const { data, params } = $props();

  let target = $state<HTMLElement | null>(null);
  let currentQuestionIndex = $state(0);
  let selectedOptionIndex = $state(-1);
  let isFeedbackModalOpen = $state(false);
  let isCompletionModalOpen = $state(false);

  const currentQuestion = $derived(data.questionAnswers[currentQuestionIndex]);
  const isCorrectAnswer = $derived(selectedOptionIndex === currentQuestion.answer);

  const player = Player.get();
  const isWithinViewport = new IsWithinViewport(() => target);

  onMount(() => {
    player.stop();
  });

  const toggleFeedbackModalVisibility = () => {
    isFeedbackModalOpen = !isFeedbackModalOpen;
  };

  const handleContinueClick = () => {
    const isLastQuestion = currentQuestionIndex === data.questionAnswers.length - 1;

    isFeedbackModalOpen = false;

    if (isLastQuestion) {
      isCompletionModalOpen = true;
      return;
    }

    // Move to next question.
    currentQuestionIndex++;
    selectedOptionIndex = -1;
  };
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-slate-100/90 backdrop-blur-sm">
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
        class="rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
      >
        <ArrowLeft />
      </a>

      <Badge variant="slate">
        Question {currentQuestionIndex + 1} of {data.questionAnswers.length}
      </Badge>
    </div>
  </div>
</header>

<div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

<main class="pt-23 relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-10 px-4 pb-3">
  <div class="flex flex-1 flex-col gap-y-2">
    {#each data.questionAnswers as q, qi (q.id)}
      <div class={['flex flex-col gap-y-4', currentQuestionIndex !== qi && 'hidden']}>
        <span id="question-{qi}" class="text-xl font-medium">{q.question}</span>

        <div class="flex flex-col gap-y-2" role="radiogroup" aria-labelledby="question-{qi}">
          {#each q.options as o, oi (o)}
            <label
              class={[
                'has-focus-visible:outline-dashed shadow-xs group flex cursor-pointer items-center gap-x-3 rounded-2xl border-2 border-transparent bg-white px-2.5 py-3.5 transition-all',
                'hover:shadow-sm hover:ring-1 hover:ring-slate-300',
                'has-checked:hover:bg-white has-checked:border-slate-950 has-checked:hover:shadow-xs has-checked:hover:translate-none',
                'has-focus-visible:outline-dashed has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-slate-950',
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
                class="group-has-checked:bg-slate-950 group-has-checked:text-white rounded-lg bg-slate-200 px-2.5 py-1 font-semibold transition-colors"
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
        class="cursor-pointer rounded-full p-3 transition-colors hover:bg-slate-100 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
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
            'shadow-xs flex items-center gap-x-3 rounded-2xl border-2 px-2.5 py-3.5',
            isCorrectAnswer ? 'border-transparent bg-lime-200' : 'border-slate-950 bg-white',
          ]}
        >
          <span
            class={[
              'rounded-lg px-2.5 py-1 font-semibold',
              isCorrectAnswer ? 'bg-lime-400' : 'bg-slate-950 text-white',
            ]}
          >
            {String.fromCharCode(65 + selectedOptionIndex)}
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
            class="shadow-xs flex items-center gap-x-3 rounded-2xl border-2 border-transparent bg-lime-200 px-2.5 py-3.5"
          >
            <span class="rounded-lg bg-lime-400 px-2.5 py-1 font-semibold">
              {String.fromCharCode(65 + currentQuestion.answer)}
            </span>

            <span class="text-left">
              {currentQuestion.options[currentQuestion.answer]}
            </span>
          </div>
        </div>
      {/if}

      <div class="flex flex-col gap-y-2 rounded-2xl bg-slate-100 p-3">
        <span class="font-medium text-slate-500">Explanation</span>
        <span>{currentQuestion.explanation}</span>
      </div>
    </div>

    <Button width="full" onclick={handleContinueClick}>Continue</Button>
  </main>
</Modal>

<Modal isopen={isCompletionModalOpen} onclose={noop} variant="dark">
  <Starfield class="text-white" />

  <div class="mx-auto flex min-h-svh max-w-5xl flex-col px-4 py-3">
    <div class="flex flex-1 flex-col items-center justify-center">
      <enhanced:img
        src="$lib/assets/meteors.png?w=768"
        alt="meteors"
        sizes="384px"
        class="h-full w-full object-contain"
      />
    </div>

    <div class="flex flex-col gap-y-12">
      <div class="flex flex-col gap-y-4 text-center">
        <span class="text-xl font-medium">That was insightful!</span>

        <div class="flex flex-col items-center gap-y-2">
          <span>You have earned completion status for</span>

          <Badge variant={tagCodeToBadgeVariant(data.type)}>{data.label}</Badge>

          <span>Track completed topics on your profile.</span>
        </div>
      </div>

      <div class="flex flex-col items-center py-5">
        <LinkButton href={`/unit/${params.id}`} variant="secondary" width="full" class="max-w-sm">
          Done
        </LinkButton>
      </div>
    </div>
  </div>
</Modal>
