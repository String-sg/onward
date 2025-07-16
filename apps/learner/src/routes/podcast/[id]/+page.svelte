<script lang="ts">
  import { ArrowLeft, Share } from '@lucide/svelte';
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-slate-100/90 backdrop-blur-sm">
  <div class="absolute inset-x-0 top-full h-px bg-transparent transition-colors duration-300"></div>

  <div class="mx-auto w-full max-w-5xl px-4 py-3">
    <div class="flex items-center justify-between gap-x-8">
      <a href="/" class="rounded-full p-4 transition-colors hover:bg-slate-200">
        <ArrowLeft />
      </a>

      <button class="cursor-pointer rounded-full p-4 transition-colors hover:bg-slate-200">
        <Share />
      </button>
    </div>
  </div>
</header>

<main class="pt-23 relative mx-auto min-h-full w-full max-w-5xl px-4 pb-3">
  <!-- Main content of the page -->
</main>
