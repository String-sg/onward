<script lang="ts">
  import { BrainCircuit, Funnel } from '@lucide/svelte';

  import Collection from '$lib/components/Collection.svelte';
</script>

<div class="flex flex-col px-6">
  <div class="flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <span class="text-xl font-semibold">Your learnings</span>

      <div class="flex gap-4">
        <div class="flex h-14 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <BrainCircuit />
        </div>
        <div class="flex h-14 w-12 items-center justify-center rounded-2xl bg-slate-100">
          <Funnel />
        </div>
      </div>
    </div>

    <div class="grid auto-rows-fr grid-cols-2 gap-4 [&>:first-child]:col-span-2">
      <!-- Collection 1 -->
      <Collection
        title="SEN peer support"
        tag="Special Educational Needs"
        numberofpodcasts={12}
        numberofnotes={2}
        variant="purple"
        to="/learning/collection/1"
      />

      <!-- Collection 2 -->
      <Collection
        title="Learn to use AI"
        tag="Artificial Intelligence"
        numberofpodcasts={8}
        numberofnotes={3}
        variant="amber"
        to="/learning/collection/2"
      />

      <!-- Collection 3 -->
      <Collection
        title="Strategies: Basic counselling"
        tag="Supporting Student socio-emotional learning"
        numberofpodcasts={10}
        numberofnotes={1}
        variant="teal"
        to="/learning/collection/3"
      />
    </div>
  </div>
</div>
