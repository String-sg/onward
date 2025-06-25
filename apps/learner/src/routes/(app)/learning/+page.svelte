<script lang="ts">
  import {
    BrainCircuit,
    Funnel,
    HandHeart,
    MessageCircleQuestion,
    PersonStanding,
  } from '@lucide/svelte';

  import Collection from '$lib/components/Collection.svelte';
</script>

<div class="flex flex-col px-6">
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <span class="text-xl font-semibold">Your learnings</span>

      <div class="flex gap-4">
        <div class="flex h-14 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <div class="text-slate-950"><BrainCircuit class="h-6 w-6" /></div>
        </div>
        <div class="flex h-14 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <div class="text-slate-950"><Funnel class="h-6 w-6" /></div>
        </div>
      </div>
    </div>

    <div class="grid auto-rows-fr grid-cols-2 gap-4 [&>:first-child]:col-span-2">
      <!-- Collection 1 -->
      <Collection
        title="Special Educational Needs"
        icon={HandHeart}
        numberofpodcasts={12}
        numberofnotes={2}
        variant="purple"
      />

      <!-- Collection 2 -->
      <Collection
        title="Character and Citizenship Education"
        icon={PersonStanding}
        numberofpodcasts={8}
        numberofnotes={3}
        variant="rose"
      />

      <!-- Collection 3 -->
      <Collection
        title="Inclusive Education"
        icon={MessageCircleQuestion}
        numberofpodcasts={10}
        numberofnotes={1}
        variant="amber"
      />
    </div>
  </div>
</div>
