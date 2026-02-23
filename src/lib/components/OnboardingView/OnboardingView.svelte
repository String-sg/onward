<script lang="ts">
  import { ArrowLeft, X } from '@lucide/svelte';
  import { fly } from 'svelte/transition';

  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/state';
  import { Button } from '$lib/components/Button';
  import { Modal } from '$lib/components/Modal/index.js';
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
  let isSubscribePage = $state(false);
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
    selectedTopics = [];
  };

  const handleTopicPageNext = () => {
    isTopicSelectionPage = false;
    isFrequencySelectionPage = true;
    selectedFrequency = null;
  };

  const handleConfirm = async () => {
    const payload = {
      topics: selectedTopics,
      frequency: selectedFrequency,
      csrfToken: page.data.csrfToken,
    };

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 401) {
          return goto('/login');
        }

        console.error('Failed to onboard user');
        return;
      }

      isFrequencySelectionPage = false;
      isSubscribePage = true;
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = async () => {
    onclose();
    await invalidateAll();
  };

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isSubscribed: true,
          csrfToken: page.data.csrfToken,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          return goto('/login');
        }

        console.error('Failed to onboard user');
        return;
      }
    } catch (error) {
      console.error(error);
    }

    await handleClose();
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
      description: 'AI news, use cases and tools to master the changing landscape.',
      type: 'AI',
    },
    'career-growth': {
      title: 'Career Growth',
      description: 'Tips to help you set career goals and transform potential into performance.',
      type: 'CAREER',
    },
    'educator-voices': {
      title: 'Educator Voices',
      description: 'Inspiring stories from fellow educators.',
      type: 'EDU_VOICES',
    },
    'employee-engagement': {
      title: 'Employee Engagement',
      description:
        'Analyze EES results and get practical tips to maintain workplace staff engagement.',
      type: 'EMP_ENGAGEMENT',
    },
    'in-the-news': {
      title: 'In the News',
      description: 'Education news and survey highlights for ground insights.',
      type: 'NEWS',
    },
    infrastructure: {
      title: 'Infrastructure',
      description: 'Learn about device setups, connectivity, and digital tools for efficient work.',
      type: 'INFRA',
    },
    innovation: {
      title: 'Innovation',
      description: 'Strategies to empower new ideas, innovation, and creative thinking.',
      type: 'INNOV',
    },
    'learn-with-bob': {
      title: 'Learn with Bob',
      description: 'SPACES framework for purposeful work and a sustainable pace.',
      type: 'BOB',
    },
    productivity: {
      title: 'Productivity',
      description:
        'Master time management and workflows to minimize distractions and reach goals faster.',
      type: 'PROD',
    },
    'student-development': {
      title: 'Student Development',
      description:
        "Learn ways to develop students' cognitive, affective, physical and aesthetic abilities.",
      type: 'STU_DEV',
    },
    'student-wellbeing': {
      title: 'Student Wellbeing',
      description: 'Learn ways to support students emotional and physical health.',
      type: 'STU_WELL',
    },
    wellbeing: {
      title: 'Wellbeing',
      description:
        'Identify workplace stress, monitor peer distress, conduct check-ins, and provide support resources.',
      type: 'WELLBEING',
    },
  };
</script>

<!-- Modal -->
<Modal
  {isopen}
  onclose={handleConfirm}
  variant="light"
  size="full"
  closeonescape={false}
  closeonbackdropclick={false}
>
  {#if isStartPage}
    <div class="relative mx-auto flex min-h-svh w-full flex-col bg-slate-100 pt-3">
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

      <div class="flex flex-1 flex-col items-center justify-center overflow-x-hidden">
        <enhanced:img
          src="$lib/assets/onboarding-bites.png"
          alt="Onboarding bags of chips"
          class="max-w-[700px]"
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
          <button
            onclick={handleBackToStart}
            class="cursor-pointer rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
          >
            <ArrowLeft />
          </button>
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

        <div class="flex justify-center px-4 pt-4 pb-13">
          <Button
            variant="primary"
            width="full"
            onclick={handleTopicPageNext}
            disabled={isNextDisabled}
          >
            Next
          </Button>
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
          <button
            onclick={handleBackToTopic}
            class="cursor-pointer rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
          >
            <ArrowLeft />
          </button>
        </div>
      </header>

      <div class="relative mx-auto flex h-full w-full max-w-5xl flex-col pt-23">
        <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

        <div class="flex flex-1 flex-col gap-y-6 overflow-y-auto px-4 py-3">
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
                  value="DEEPDIVE"
                  class="sr-only"
                  bind:group={selectedFrequency}
                />

                <div class="flex w-full items-center justify-between">
                  <span class="text-lg font-medium">Deep Dive</span>
                  <span class="text-sm text-slate-500">10-15 mins</span>
                </div>
              </div>
            </label>
          </div>

          {#if selectedFrequency}
            <div class="rounded-2xl bg-slate-200 p-6">
              <div class="flex flex-col gap-y-2">
                {#if selectedFrequency === 'QUICK'}
                  <span>
                    5 mins per day sounds small, but that's actually 30 bites per month!
                  </span>
                {/if}
                {#if selectedFrequency === 'REGULAR'}
                  <span>
                    10 mins per day sounds small, but that's actually 60 bites per month!
                  </span>
                {/if}
                {#if selectedFrequency === 'DEEPDIVE'}
                  <span>
                    15 mins per day sounds small, but that's actually 90 bites per month!
                  </span>
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <div class="flex justify-center px-4 pt-4 pb-13">
          <Button
            variant="primary"
            width="full"
            onclick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  {:else if isSubscribePage}
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

        <div class="mx-auto flex w-full max-w-5xl items-center justify-end px-4 py-3">
          <button
            onclick={handleClose}
            class="cursor-pointer rounded-full p-4 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
          >
            <X />
          </button>
        </div>
      </header>

      <div class="relative mx-auto flex h-full w-full max-w-5xl flex-col pt-23">
        <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

        <div class="flex flex-1 flex-col gap-y-6 overflow-y-auto px-4 py-3">
          <div class="flex flex-col items-center">
            <div class="flex flex-col gap-y-3">
              <div class="flex flex-col text-center text-3xl">
                <span>One last thing!</span>
              </div>

              <div class="flex flex-col text-center text-slate-600">
                <span>Want fresh learning bites delivered to your inbox?</span>
                <span
                  >Get a monthly serving of educator stories, trending topics, and classroom-ready
                  tips.
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-1 flex-col items-center justify-center">
            <enhanced:img
              src="$lib/assets/cycling-man.png"
              alt="Man cycling"
              class="max-w-[500px]"
            />
          </div>
        </div>

        <div class="flex flex-col justify-center gap-y-3 px-4 py-3 pb-10">
          <Button variant="primary" width="full" onclick={handleSubscribe}>Subscribe</Button>

          <Button variant="secondary" width="full" onclick={handleClose}>Remind Me Later</Button>
        </div>
      </div>
    </div>
  {/if}
</Modal>
