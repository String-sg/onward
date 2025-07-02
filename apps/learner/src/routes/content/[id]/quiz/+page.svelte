<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  import { goto } from '$app/navigation';
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

  function goBack() {
    goto(`/content/${contentId}`);
  }
</script>

<main class="mx-auto flex h-full w-full max-w-5xl flex-col bg-slate-100">
  <div class="align-center flex justify-between px-6 py-5">
    <button
      class="align-center flex cursor-pointer gap-1 rounded-full bg-slate-200 p-2"
      onclick={() => goBack()}
    >
      <ArrowLeft />
    </button>
  </div>
  <div class="px-6 text-xl font-medium">{currentQuestion.question}</div>
  <div class="flex flex-col items-start gap-2 px-6 pt-6">
    {#each currentQuestion.options as option, index (option)}
      <button
        class="flex h-16 cursor-pointer items-center gap-3 self-stretch rounded-2xl bg-white p-3 {selectedOptionIndex ===
        index
          ? 'border border-black'
          : ''}"
        onclick={() => selectOption(index)}
      >
        <div
          class="flex items-center justify-center gap-1 rounded-lg {selectedOptionIndex === index
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100'} px-2 py-1"
        >
          {getOptionLetter(index)}
        </div>
        {option}
      </button>
    {/each}
  </div>

  <div class="py-9.5 mt-auto flex flex-col px-6">
    <button
      class="flex justify-center gap-1 rounded-full {selectedOptionIndex === -1
        ? ' cursor-not-allowed bg-slate-900/[0.5]'
        : 'cursor-pointer bg-slate-900'} px-1 py-4 text-white"
      onclick={nextQuestion}
      disabled={selectedOptionIndex === -1}
    >
      Check Answer
    </button>
  </div>
</main>
