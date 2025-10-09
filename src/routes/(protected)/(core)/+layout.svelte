<script lang="ts">
  import { BookHeart, Compass, Home } from '@lucide/svelte';

  import { page } from '$app/state';
  import { IsWithinViewport } from '$lib/helpers/index.js';

  const { data, children } = $props();

  let target = $state<HTMLElement | null>(null);

  const isHomePage = $derived(page.url.pathname === '/');
  const isLearningPage = $derived(page.url.pathname === '/learning');
  const isExplorePage = $derived(page.url.pathname === '/explore');

  const isWithinViewport = new IsWithinViewport(() => target);
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-slate-100/90 backdrop-blur-sm">
  <div
    class={[
      'absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300',
      !isWithinViewport.current && '!bg-slate-950/7.5',
    ]}
  ></div>

  <div class="mx-auto w-full max-w-5xl px-4 py-3">
    <div class="flex flex-col gap-y-4">
      <div class="flex items-center justify-between px-2">
        <a href="/" class="flex items-center gap-x-1" aria-label="Home">
          {@render logo()}
          <span class="font-mono text-xl font-bold">glow</span>
        </a>
        <a
          href="/profile"
          aria-label="Profile"
          class="h-10 w-10 cursor-pointer overflow-hidden rounded-full"
        >
          <img src={data.avatarURL} alt="profile" />
        </a>
      </div>

      <div class="flex items-center rounded-[80px] bg-white px-4 shadow-xs">
        <a
          href="/"
          class="group flex flex-1 cursor-pointer flex-col items-center justify-center gap-y-1 pt-3 pb-4"
        >
          <div
            class={[
              'rounded-[100px] px-5 py-1 transition-colors',
              isHomePage && 'bg-slate-950 text-white',
            ]}
          >
            <Home />
          </div>
          <span
            class={[
              'text-center text-xs font-semibold',
              isHomePage ? 'text-slate-950' : 'text-slate-700',
            ]}
          >
            Home
          </span>
        </a>

        <a
          href="/learning"
          class="group flex flex-1 cursor-pointer flex-col items-center justify-center gap-y-1 pt-3 pb-4"
        >
          <div
            class={[
              'rounded-[100px] px-5 py-1 transition-colors',
              isLearningPage && 'bg-slate-950 text-white',
            ]}
          >
            <BookHeart />
          </div>
          <span
            class={[
              'text-center text-xs font-semibold',
              isLearningPage ? 'text-slate-950' : 'text-slate-700',
            ]}
          >
            Learning
          </span>
        </a>

        <a
          href="/explore"
          class="group flex flex-1 cursor-pointer flex-col items-center justify-center gap-y-1 pt-3 pb-4"
        >
          <div
            class={[
              'rounded-[100px] px-5 py-1 transition-colors',
              isExplorePage && 'bg-slate-950 text-white',
            ]}
          >
            <Compass />
          </div>
          <span
            class={[
              'text-center text-xs font-semibold',
              isExplorePage ? 'text-slate-950' : 'text-slate-700',
            ]}
          >
            Explore
          </span>
        </a>
      </div>
    </div>
  </div>
</header>

<div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

{@render children()}

{#snippet logo()}
  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.0034 6.68726L17.7358 14.2625L25.3345 16.0007H25.3267L17.7358 17.7371L16.0034 25.3123V25.3337L16.0005 25.323L15.9985 25.3337V25.3123L14.2661 17.738L6.67236 16.0007H6.66846L14.2661 14.2625L15.9985 6.68726V6.66675L16.0005 6.67651L16.0034 6.66675V6.68726Z"
      fill="currentColor"
    />
    <ellipse cx="15.9994" cy="2.8485" rx="0.848546" ry="0.848502" fill="currentColor" />
    <ellipse cx="15.9994" cy="29.152" rx="0.848546" ry="0.848502" fill="currentColor" />
    <ellipse
      cx="29.1515"
      cy="16.0001"
      rx="0.848502"
      ry="0.848546"
      transform="rotate(90 29.1515 16.0001)"
      fill="currentColor"
    />
    <ellipse
      cx="2.84872"
      cy="16.0001"
      rx="0.848502"
      ry="0.848546"
      transform="rotate(90 2.84872 16.0001)"
      fill="currentColor"
    />
    <circle
      cx="0.848524"
      cy="0.848524"
      r="0.848524"
      transform="matrix(-0.707112 0.707102 -0.707112 -0.707102 26.5024 25.2993)"
      fill="currentColor"
    />
    <circle
      cx="0.848524"
      cy="0.848524"
      r="0.848524"
      transform="matrix(-0.707112 0.707102 -0.707112 -0.707102 7.90137 6.7002)"
      fill="currentColor"
    />
    <circle
      cx="0.848524"
      cy="0.848524"
      r="0.848524"
      transform="matrix(-0.707112 -0.707102 0.707111 -0.707102 6.70068 26.5)"
      fill="currentColor"
    />
    <circle
      cx="0.848524"
      cy="0.848524"
      r="0.848524"
      transform="matrix(-0.707112 -0.707102 0.707111 -0.707102 25.2988 7.90088)"
      fill="currentColor"
    />
  </svg>
{/snippet}
