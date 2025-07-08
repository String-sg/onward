<script lang="ts">
  import Collection, { type Variant } from '$lib/components/Collection.svelte';

  const { data } = $props();
</script>

<div class="flex flex-col gap-y-6 overflow-y-auto p-6">
  <span class="text-xl font-semibold">Your learnings</span>

  <div class="flex flex-col gap-4">
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
