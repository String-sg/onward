<script lang="ts">
  import { page } from '$app/state';

  const is404 = page.status === 404;
</script>

<main
  class="relative mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center gap-y-4 px-4 py-3"
>
  <h1 class="text-center text-2xl font-semibold">
    {is404 ? 'Page not found' : 'Something went wrong'}
  </h1>

  <enhanced:img src="$lib/assets/desert.png?w=200" alt="Page not found" />

  <div class="flex flex-col items-center gap-y-8">
    <a href="/" class="w-64 rounded-full bg-slate-950 px-4 py-3 text-center text-sm text-white">
      Go to Home
    </a>

    <p class="max-w-xs text-center text-slate-900">
      {#if is404}
        The page you are looking for does not exist.
      {:else}
        If the problem persists, please contact the
        <a href="mailto:support@example.com" class="text-slate-900 underline">IT team</a>.
      {/if}
    </p>
  </div>
</main>
