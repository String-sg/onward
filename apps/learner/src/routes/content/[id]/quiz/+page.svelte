<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  import { page } from '$app/state';

  const { data } = $props();

  let selectedOptionIndex = $state(-1);
  let currentQuestionIndex = $state(0);

  let currentQuestion = $derived(data.questionAnswers[currentQuestionIndex]);

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

<main class="mx-auto flex h-full w-full max-w-5xl flex-col">
  <div class="item-center flex justify-between px-6 py-5">
    <a
      href="/content/{contentId}"
      class="item-center cursor-pointer items-center rounded-[100px] bg-slate-200 px-3 py-4"
    >
      <ArrowLeft />
    </a>
  </div>

  <div class="flex h-full flex-col px-6">
    <div class="flex-1">
      <span class="text-xl font-medium">{currentQuestion.question}</span>
      <div class="flex flex-col items-start gap-y-2 pt-6">
        {#each currentQuestion.options as option, index (option)}
          <button
            class={[
              selectedOptionIndex === index && 'border border-black',
              'flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white p-3',
            ]}
            onclick={() => selectOption(index)}
          >
            <span
              class={[
                selectedOptionIndex === index ? 'bg-slate-900 text-white' : 'bg-slate-100',
                'flex items-center justify-center rounded-lg px-2 py-1 text-xs font-semibold',
              ]}
            >
              {getOptionLetter(index)}
            </span>
            <span class="text-sm">
              {option}
            </span>
          </button>
        {/each}
      </div>
    </div>

    <div class="py-9.5 mt-auto">
      <button
        class={[
          selectedOptionIndex === -1
            ? ' cursor-not-allowed bg-slate-900/[0.5]'
            : 'cursor-pointer bg-slate-900',
          'flex w-full justify-center rounded-full px-1 py-4 text-white',
        ]}
        onclick={nextQuestion}
        disabled={selectedOptionIndex === -1}
      >
        Check Answer
      </button>
    </div>
  </div>
</main>
