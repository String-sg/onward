<script>
  import { Play } from '@lucide/svelte';

  import Badge from '$lib/components/Badge.svelte';
</script>

<div class="px-6 pt-5">
  <div class="flex flex-col rounded-3xl bg-purple-100 p-6">
    <div class="flex flex-wrap gap-1">
      <Badge variant="blue">Special Educational Needs</Badge>
      <Badge variant="orange">Special Educational Needs</Badge>
      <Badge variant="amber">Special Educational Needs</Badge>
      <Badge variant="teal">Special Educational Needs</Badge>
      <Badge variant="rose">Special Educational Needs</Badge>
      <Badge variant="purple">Special Educational Needs</Badge>
      <Badge variant="slate">Special Educational Needs</Badge>
    </div>

    <div class="mt-1">
      <span class="text-xl font-medium text-slate-950">
        Navigating Special Educational Needs in Singapore: A Path to Inclusion
      </span>
    </div>

    <div class="mt-3 flex gap-x-1">
      <span class="text-sm text-slate-600">Guidance Branch</span>
      <span class="text-sm text-slate-600">•</span>
      <span class="text-sm text-slate-600">2 days ago</span>
    </div>

    <div class="mt-5 flex justify-start gap-3">
      <button class="flex items-center justify-center gap-2 rounded-full bg-purple-300 px-6 py-4">
        <Play />
        <span>Play</span>
      </button>

      <div class="flex items-center justify-center gap-2">
        <svg viewBox="0 0 24 24" class="h-6 w-6">
          <circle cx="12" cy="12" r="9" stroke="#D8B4FE" fill="none" stroke-width="3px" />
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="#A855F7"
            fill="none"
            stroke-width="3px"
            stroke-dasharray="56.55"
            stroke-dashoffset="12"
            transform-origin="center"
            transform="rotate(-90 0 0)"
          />
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="#6B21A8"
            fill="none"
            stroke-width="3px"
            stroke-dasharray="56.55"
            stroke-dashoffset="25"
            transform-origin="center"
            transform="rotate(-90 0 0)"
          />
        </svg>

        <span class="text-sm text-slate-600">23m left</span>
      </div>
    </div>
  </div>
</div>
