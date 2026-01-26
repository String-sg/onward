<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';
  import { fade, fly } from 'svelte/transition';

  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/state';
  import { Button } from '$lib/components/Button';
  import { Modal } from '$lib/components/Modal/index.js';
  import { Portal } from '$lib/components/Portal/index.js';
  import { IsWithinViewport } from '$lib/helpers/index.js';

  export interface Props {
    /**
     * Indicates whether the view is open.
     */
    isopen: boolean;
    /**
     * A callback invoked when the view is closed.
     */
    onclose: () => void;
  }

  const { isopen, onclose }: Props = $props();

  let target = $state<HTMLElement | null>(null);
  let isStartPage = $state(true);
  let isTopicSelectionPage = $state(false);
  let isFrequencySelectionPage = $state(false);
  let selectedTopics = $state<string[]>([]);
  let selectedFrequency = $state<string | null>(null);

  let isNextDisabled = $derived(selectedTopics.length < 3);

  let isConfirmDisabled = $derived(selectedFrequency === null);

  const isWithinViewport = new IsWithinViewport(() => target);

  $effect(() => {
    document.body.style.overflow = isopen ? 'hidden' : '';
  });

  const handleStart = () => {
    isStartPage = false;
    isTopicSelectionPage = true;
  };

  const handleBackToStart = () => {
    isTopicSelectionPage = false;
    isStartPage = true;
    selectedTopics = [];
  };

  const handleBackToTopic = () => {
    isFrequencySelectionPage = false;
    isTopicSelectionPage = true;
  };

  const handleTopicPageNext = () => {
    isTopicSelectionPage = false;
    isFrequencySelectionPage = true;
  };

  const handleClose = async () => {
    const payload = {
      topics: selectedTopics,
      frequency: selectedFrequency,
      csrfToken: page.data.csrfToken,
    };

    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      await invalidateAll();
      onclose();
    }
  };

  const handleTopicChange = (type: string, checked: boolean) => {
    if (checked) {
      selectedTopics = [...selectedTopics, type];
    } else {
      selectedTopics = selectedTopics.filter((topic) => topic !== type);
    }
  };

  const collectionsList = {
    'artificial-intelligence': {
      title: 'Artificial Intelligence',
      description: 'Description of the topic',
      type: 'AI',
    },
    'career-growth': {
      title: 'Career Growth',
      description: 'Description of the topic',
      type: 'CAREER',
    },
    'educator-voices': {
      title: 'Educator Voices',
      description: 'Description of the topic',
      type: 'EDU_VOICES',
    },
    'employee-engagement': {
      title: 'Employee Engagement',
      description: 'Description of the topic',
      type: 'EMP_ENGAGEMENT',
    },
    'in-the-news': {
      title: 'In the News',
      description: 'Description of the topic',
      type: 'NEWS',
    },
    infrastructure: {
      title: 'Infrastructure',
      description: 'Description of the topic',
      type: 'INFRA',
    },
    innovation: {
      title: 'Innovation',
      description: 'Description of the topic',
      type: 'INNOV',
    },
    'learn-with-bob': {
      title: 'Learn with Bob',
      description: 'Description of the topic',
      type: 'BOB',
    },
    productivity: {
      title: 'Productivity',
      description: 'Description of the topic',
      type: 'PROD',
    },
    'student-development': {
      title: 'Student Development',
      description: 'Description of the topic',
      type: 'STU_DEV',
    },
    'student-wellbeing': {
      title: 'Student Wellbeing',
      description: 'Description of the topic',
      type: 'STU_WELL',
    },
    wellbeing: {
      title: 'Wellbeing',
      description: 'Description of the topic',
      type: 'WELLBEING',
    },
  };
</script>

<Portal>
  {#if isopen}
    <!-- Backdrop -->
    <div transition:fade={{ duration: 300 }} class="fixed inset-0 z-199 bg-slate-950/50"></div>

    <!-- Modal -->
    <Modal
      isopen
      onclose={handleClose}
      variant="light"
      size="full"
      closeonescape={false}
      closeonbackdropclick={false}
    >
      {#if isStartPage}
        <div class="relative mx-auto flex min-h-svh w-full flex-col pt-3">
          <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

          <div class="mx-auto w-full max-w-5xl">
            <div class="flex flex-col items-center gap-y-3 px-4 pt-3">
              <div class="flex flex-col text-center text-3xl">
                <span>
                  {`Hi${page.data.username ? ` ${page.data.username}` : ''}!`}
                </span>
                <span>Welcome to Glow!</span>
              </div>

              <div class="flex flex-col text-center">
                <span>You are already ahead in personal</span>
                <span>growth as MOE teacher / staff.</span>
                <span>Let's get started</span>
              </div>
            </div>
          </div>

          <div class="flex flex-1 flex-col items-center justify-center">
            <enhanced:img
              src="$lib/assets/bags-of-bites.png"
              alt="Collection Images"
              class="max-w-[500px]"
            />
          </div>

          <div class="mx-auto w-full max-w-5xl">
            <div class="flex justify-center px-4 pb-13">
              <Button onclick={handleStart} variant="primary" width="full">Start</Button>
            </div>
          </div>
        </div>
      {:else if isTopicSelectionPage}
        <div
          class="fixed inset-0 z-200 bg-slate-100"
          transition:fly={{ duration: 300, x: '100%', opacity: 1 }}
        >
          <header class="fixed inset-x-0 top-0 z-250 flex backdrop-blur-sm">
            <div
              class={[
                'inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
                !isWithinViewport.current && '!bg-slate-950/7.5',
              ]}
            ></div>

            <div class="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
              <div class="flex items-center gap-x-2">
                <button
                  onclick={handleBackToStart}
                  class="cursor-pointer rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
                >
                  <ArrowLeft />
                </button>
              </div>
            </div>
          </header>

          <div class="relative mx-auto flex h-full w-full max-w-5xl flex-col pt-23">
            <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

            <div class="flex flex-1 flex-col overflow-hidden px-4 py-3">
              <div class="flex flex-col items-center gap-y-6">
                <div class="flex flex-col gap-y-3">
                  <div class="flex flex-col text-center text-3xl">
                    <span>What interests you?</span>
                  </div>

                  <div class="flex flex-col text-center">
                    <span>Select at least 3 topics you'd like to learn about</span>
                  </div>
                </div>
              </div>

              <div class="overflow-y-auto pt-6">
                <div class="flex w-full flex-col gap-y-2" role="group" aria-labelledby="topic">
                  {#each Object.entries(collectionsList) as [key, { title, description, type }] (key)}
                    <label
                      class={[
                        'group flex cursor-pointer items-center rounded-3xl border border-slate-200 bg-white',
                        'px-2.5 py-3.5 transition-[border-color,box-shadow] has-focus-visible:outline-dashed',
                        'hover:ring-1 hover:ring-slate-200',
                        'has-checked:border-3 has-checked:border-slate-950 has-checked:ring-slate-950',
                        'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-slate-950 has-focus-visible:outline-dashed',
                      ]}
                    >
                      <div class="flex items-center gap-x-4 p-4">
                        <input
                          type="checkbox"
                          name="topics"
                          value={type}
                          class="sr-only"
                          onchange={(e) => handleTopicChange(type, e.currentTarget.checked)}
                        />

                        <img
                          src="/src/lib/assets/collections/{key}.png"
                          alt={title}
                          class="h-24 w-20"
                        />

                        <div class="flex flex-col gap-y-1 text-left">
                          <span class="text-lg font-medium">{title}</span>
                          <span class="text-sm text-slate-500">{description}</span>
                        </div>
                      </div>
                    </label>
                  {/each}
                </div>
              </div>
            </div>

            <div class="flex justify-center px-4 pb-13">
              <Button
                variant="primary"
                width="full"
                onclick={handleTopicPageNext}
                disabled={isNextDisabled}>Next</Button
              >
            </div>
          </div>
        </div>
      {:else if isFrequencySelectionPage}
        <div
          class="fixed inset-0 z-200 bg-slate-100"
          transition:fly={{ duration: 300, x: '100%', opacity: 1 }}
        >
          <header class="fixed inset-x-0 top-0 z-250 flex backdrop-blur-sm">
            <div
              class={[
                'inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
                !isWithinViewport.current && '!bg-slate-950/7.5',
              ]}
            ></div>

            <div class="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
              <div class="flex items-center gap-x-2">
                <button
                  onclick={handleBackToTopic}
                  class="cursor-pointer rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
                >
                  <ArrowLeft />
                </button>
              </div>
            </div>
          </header>

          <div class="relative mx-auto flex h-full w-full max-w-5xl flex-col pt-23">
            <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

            <div class="flex flex-1 flex-col gap-y-6 px-4 py-3">
              <div class="flex flex-col items-center">
                <div class="flex flex-col gap-y-3">
                  <div class="flex flex-col text-center text-3xl">
                    <span>How long can you invest in learning per day?</span>
                  </div>

                  <div class="flex flex-col text-center text-slate-600">
                    <span>Before and/or after the long and tiring</span>
                    <span>teaching duties ended!</span>
                  </div>
                </div>
              </div>

              <div
                class="flex w-full flex-col gap-y-4 py-4"
                role="radiogroup"
                aria-labelledby="frequency"
              >
                <label
                  class={[
                    'group flex cursor-pointer items-center rounded-3xl border border-slate-200 bg-white',
                    'px-2.5 py-3.5 transition-[border-color,box-shadow] has-focus-visible:outline-dashed',
                    'hover:ring-1 hover:ring-slate-200',
                    'has-checked:border-3 has-checked:border-slate-950 has-checked:ring-slate-950',
                    'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-slate-950 has-focus-visible:outline-dashed',
                  ]}
                >
                  <div class="flex w-full items-center gap-x-4 p-4">
                    <input
                      type="radio"
                      name="frequency"
                      value="QUICK"
                      class="sr-only"
                      bind:group={selectedFrequency}
                    />

                    <div class="flex w-full items-center justify-between">
                      <span class="text-lg font-medium">Quick</span>
                      <span class="text-sm text-slate-500">3-5 mins</span>
                    </div>
                  </div>
                </label>

                <label
                  class={[
                    'group flex cursor-pointer items-center rounded-3xl border border-slate-200 bg-white',
                    'px-2.5 py-3.5 transition-[border-color,box-shadow] has-focus-visible:outline-dashed',
                    'hover:ring-1 hover:ring-slate-200',
                    'has-checked:border-3 has-checked:border-slate-950 has-checked:ring-slate-950',
                    'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-slate-950 has-focus-visible:outline-dashed',
                  ]}
                >
                  <div class="flex w-full items-center gap-x-4 p-4">
                    <input
                      type="radio"
                      name="frequency"
                      value="REGULAR"
                      class="sr-only"
                      bind:group={selectedFrequency}
                    />

                    <div class="flex w-full items-center justify-between">
                      <span class="text-lg font-medium">Regular</span>
                      <span class="text-sm text-slate-500">5-10 mins</span>
                    </div>
                  </div>
                </label>

                <label
                  class={[
                    'group flex cursor-pointer items-center rounded-3xl border border-slate-200 bg-white',
                    'px-2.5 py-3.5 transition-[border-color,box-shadow] has-focus-visible:outline-dashed',
                    'hover:ring-1 hover:ring-slate-200',
                    'has-checked:border-3 has-checked:border-slate-950 has-checked:ring-slate-950',
                    'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-slate-950 has-focus-visible:outline-dashed',
                  ]}
                >
                  <div class="flex w-full items-center gap-x-4 p-4">
                    <input
                      type="radio"
                      name="frequency"
                      value="ADVANCED"
                      class="sr-only"
                      bind:group={selectedFrequency}
                    />

                    <div class="flex w-full items-center justify-between">
                      <span class="text-lg font-medium">Advanced</span>
                      <span class="text-sm text-slate-500">10-15 mins</span>
                    </div>
                  </div>
                </label>
              </div>

              <div class="rounded-2xl bg-slate-200 p-6">
                <div class="flex flex-col gap-y-2">
                  <span>Small bites, big growth!</span>
                  <span>
                    5 mins per day sounds small, but that’s actually 70 bites per month!
                  </span>
                </div>
              </div>
            </div>

            <div class="flex justify-center px-4 pb-13">
              <Button
                variant="primary"
                width="full"
                onclick={handleClose}
                disabled={isConfirmDisabled}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      {/if}
    </Modal>
  {/if}
</Portal>
