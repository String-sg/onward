<script lang="ts">
  import { BookHeart, Compass, Home } from '@lucide/svelte';

  import { page } from '$app/state';

  const { children } = $props();

  const isHomePage = $derived(page.url.pathname === '/');
  const isLearningPage = $derived(page.url.pathname === '/learning');
  const isExplorePage = $derived(page.url.pathname === '/explore');
</script>

<main class="mx-auto flex h-full w-full max-w-5xl flex-col">
  <nav class="z-1000 sticky bg-white px-6 pt-6">
    <div class="flex flex-col gap-y-3">
      <div class="flex items-center justify-between">
        <span class="text-2xl font-semibold">Onward</span>
        <div class="h-10 w-10 rounded-full bg-gray-200"></div>
      </div>

      <div class="flex items-center rounded-[80px] bg-slate-100 px-4">
        <!-- Home -->
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

        <!-- Learning -->
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

        <!-- Explore -->
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
  </nav>

  {@render children()}
</main>
