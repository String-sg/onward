<script lang="ts">
  import Collection, { type Variant } from '$lib/components/Collection.svelte';

  const { data } = $props();
</script>

<div class="flex flex-col gap-y-6 px-6">
  <span class="text-xl font-semibold">Your learnings</span>

  <div class="grid auto-rows-fr grid-cols-2 gap-4 [&>:first-child]:col-span-2">
    {#each data.learningJourneys as learning (learning.id)}
      <Collection
        to={learning.to}
        tag={learning.tag}
        title={learning.title}
        numberofpodcasts={learning.numberofpodcasts}
        numberofnotes={learning.numberofnotes}
        variant={learning.variant as Variant}
      />
    {/each}
  </div>
</div>
