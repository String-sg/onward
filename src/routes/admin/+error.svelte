<script lang="ts">
  import { AlertTriangle } from '@lucide/svelte';
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-8">
  <div class="w-full max-w-md">
    <div class="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <div class="mb-6 flex justify-center">
        <AlertTriangle class="size-8 text-red-500" />
      </div>

      <div class="text-center">
        <span class="mb-6 text-base text-slate-600"> An unexpected error occurred. </span>
      </div>
    </div>

    <div class="mt-4 text-center">
      <span class="text-sm text-slate-500">If this problem persists, please contact support.</span>
    </div>
  </div>
</div>
