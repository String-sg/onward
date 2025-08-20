<script lang="ts">
  import { Collection, type CollectionProps } from '$lib/components/Collection/index.js';

  const { data } = $props();
</script>

<div class="flex flex-col gap-y-3">
  <div class="px-2">
    <span class="text-xl font-semibold">Your learnings</span>
  </div>

  <div class="flex flex-col gap-y-3">
    {#each data.learningJourneys as learning (learning.id)}
      <Collection
        to={learning.to}
        tag={learning.tag}
        title={learning.title}
        numberofpodcasts={learning.numberofpodcasts}
        numberofnotes={learning.numberofnotes}
        variant={learning.variant as CollectionProps['variant']}
      />
    {/each}
  </div>
</div>
