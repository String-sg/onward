<script lang="ts">
  import { AlertCircle } from '@lucide/svelte';

  import { page } from '$app/state';

  const errorCode = $derived(page.url.searchParams.get('error'));

  const errorMessages: Record<string, string> = {
    unauthorized: 'Your email address is not authorized.',
    inactive: 'Your account has been deactivated.',
    session_expired: 'Your session has expired.',
    auth_failed: 'Authentication failed.',
    server_error: 'An unexpected error occurred.',
    provider_mismatch:
      'This Google account is already linked to a different admin account. Please use the correct Google account.',
  };

  const errorMessage = $derived(errorCode ? errorMessages[errorCode] : null);
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-8">
  <div class="w-full max-w-md">
    <div class="flex flex-col rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-2xl font-medium text-slate-950">Glow</h1>
      </div>

      {#if errorMessage}
        <div class="mb-6 flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
          <AlertCircle class="mt-0.5 size-5 flex-shrink-0 text-red-600" />
          <div class="flex-1">
            <p class="text-sm text-red-800">{errorMessage}</p>
          </div>
        </div>
      {/if}

      <a
        href="/admin/auth/google?return_to=%2Fadmin%2Fdashboard"
        class=" w-full cursor-pointer rounded-full border border-slate-300 bg-slate-100 px-4 py-3 text-center text-slate-950 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
      >
        Sign in
      </a>
    </div>
  </div>
</div>
