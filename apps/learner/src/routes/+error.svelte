<script lang="ts">
  import { page } from '$app/state';
  import { LinkButton } from '$lib/components/Button/index.js';

  const is404 = page.status === 404;
</script>

<main
  class="relative mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center gap-y-8 px-4 py-3"
>
  <div class="flex flex-col items-center">
    <enhanced:img src="$lib/assets/desert.png?w=200" alt="Page not found" />

    <div class="flex flex-col gap-y-2">
      <span class="text-center text-2xl font-semibold">
        {is404 ? 'Page not found' : 'Something went wrong'}
      </span>

      <span class="text-center text-slate-900">
        {#if is404}
          The page you are looking for does not exist.
        {:else}
          If the problem persists, please contact the
          <a href="mailto:support@example.com" class=" whitespace-nowrap text-slate-900 underline"
            >IT team
          </a>.
        {/if}
      </span>
    </div>
  </div>

  <LinkButton href="/" width="full" class="max-w-md">Go to Home</LinkButton>
</main>
