<script lang="ts">
  import { page } from '$app/state';
  import { LinkButton } from '$lib/components/Button/index.js';
  import { HOME_PATH } from '$lib/helpers/index.js';

  const is404 = page.status === 404;
</script>

<main
  class="relative mx-auto flex min-h-svh max-w-5xl flex-col items-center justify-center gap-y-8 px-4 py-3"
>
  <div class="flex flex-col items-center">
    {#if is404}
      <enhanced:img
        src="$lib/assets/page-not-found.png?w=584"
        alt="Page not found"
        class="w-[292px]"
      />
    {:else}
      <enhanced:img
        src="$lib/assets/something-went-wrong.png?w=552"
        alt="Something went wrong"
        class="w-[276px]"
      />
    {/if}

    <div class="flex flex-col gap-y-2">
      <span class="text-center text-xl font-bold">
        {is404 ? 'Page not found' : 'Something went wrong'}
      </span>

      <span class="text-center font-medium text-slate-900">
        {#if is404}
          The page you are looking<br /> for does not exist.
        {:else}
          If the problem persists,<br /> please contact the
          <a href="mailto:glow@moe.edu.sg" class=" whitespace-nowrap text-slate-900 underline">
            IT team
          </a>.
        {/if}
      </span>
    </div>
  </div>

  <LinkButton href={HOME_PATH} width="full" class="max-w-sm">Go to Home</LinkButton>
</main>
