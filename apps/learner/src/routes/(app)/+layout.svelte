<script lang="ts">
  import BookHeart from '@lucide/svelte/icons/book-heart';
  import Compass from '@lucide/svelte/icons/compass';
  import Home from '@lucide/svelte/icons/home';

  import { page } from '$app/state';
  import { useIsWithinViewport } from '$lib/helpers';

  const { children } = $props();

  let target = $state<HTMLElement | null>(null);

  const isHomePage = $derived(page.url.pathname === '/');
  const isLearningPage = $derived(page.url.pathname === '/learning');
  const isExplorePage = $derived(page.url.pathname === '/explore');

  const isWithinViewport = useIsWithinViewport(() => target);
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
        <span class="text-2xl font-semibold">Onward</span>
        <div class="h-10 w-10 rounded-full bg-white"></div>
      </div>

      <div class="shadow-xs flex items-center rounded-[80px] bg-white px-4">
        <a
          href="/"
          class="group flex flex-1 cursor-pointer flex-col items-center justify-center gap-y-1 pb-4 pt-3"
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
          class="group flex flex-1 cursor-pointer flex-col items-center justify-center gap-y-1 pb-4 pt-3"
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
          class="group flex flex-1 cursor-pointer flex-col items-center justify-center gap-y-1 pb-4 pt-3"
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

<main class="pt-43 pb-25 relative mx-auto min-h-full w-full max-w-5xl px-4">
  <div bind:this={target} class="absolute inset-x-0 top-0 h-px"></div>

  {@render children()}
</main>
