<script lang="ts">
  import { page } from '$app/state';
  import Collection from '$lib/components/Collection.svelte';
  import type { LearningJourney } from '$lib/types';

  const { learningJourneys } = page.data as { learningJourneys: LearningJourney[] };
</script>

<div class="flex flex-col gap-y-6 px-6">
  <span class="text-xl font-semibold">Your learnings</span>

  <div class="grid auto-rows-fr grid-cols-2 gap-4 [&>:first-child]:col-span-2">
    {#each learningJourneys as learning (learning.id)}
      <Collection
        title={learning.title}
        tag={learning.tag}
        numberofpodcasts={learning.numberofpodcasts}
        numberofnotes={learning.numberofnotes}
        variant={learning.variant}
        to={learning.to}
      />
    {/each}
  </div>
</div>
