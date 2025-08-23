<script lang="ts">
  import { page } from '$app/state';

  const is404 = page.status === 404;
</script>

<main
  class="relative mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center gap-y-4 px-4 py-3"
>
  <div class="flex flex-col items-center gap-y-1">
    <h1 class="text-center text-3xl font-bold">
      {is404 ? 'Page not found' : 'Something went wrong'}
    </h1>

    <p class="text-center text-sm text-slate-500">
      {is404 ? 'The page you are looking for does not exist.' : 'Please try again later.'}
    </p>
  </div>

  <a href="/" class="rounded-full bg-slate-950 px-4 py-3 text-center text-sm text-white">
    Go to Home
  </a>
</main>
