<script lang="ts">
  import { LinkButton } from '$lib/components/Button/index.js';
  import { Starfield } from '$lib/components/Starfield/index.js';
</script>

<main class="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-4 py-3">
  <Starfield />

  <div class="flex flex-col items-center justify-center gap-y-3 p-5">
    {@render logo()}
    <span class="font-mono font-bold">Onward</span>
  </div>

  <div class="flex flex-1 flex-col items-center justify-center">
    <span class="font-mono text-2xl font-bold">Get started.</span>
  </div>

  <div class="flex flex-col items-center justify-center gap-y-4 p-5">
    <LinkButton href="/auth/google" variant="primary" width="full" class="max-w-sm gap-x-2">
      {@render googleIcon()}
      <span class="font-medium">Continue with Google</span>
    </LinkButton>

    <div class="flex flex-col items-center justify-center text-xs">
      <span>By continuing, you agree to our</span>
      <span>Terms and Privacy Policy.</span>
    </div>
  </div>
</main>

{#snippet logo()}
  <svg width="48" height="48" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
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

{#snippet googleIcon()}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 256 262"
    width="16"
    height="16"
  >
    <path
      fill="#4285F4"
      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
    />
    <path
      fill="#34A853"
      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
    />
    <path
      fill="#FBBC05"
      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
    />
    <path
      fill="#EB4335"
      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
    />
  </svg>
{/snippet}
