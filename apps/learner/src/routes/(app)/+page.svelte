<script lang="ts">
  import LearningUnit from '$lib/components/LearningUnit.svelte';
  import { audioPlayer } from '$lib/stores/AudioPlayerStore.svelte';

  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  if (data.recentlyLearned) {
    const audioProgressData = data.recentlyLearned
      .filter((unit) => unit.learningJourney)
      .map((unit) => ({
        learningUnitId: unit.id,
        currentTime: unit.learningJourney!.lastCheckpoint,
        completed: unit.learningJourney!.isCompleted,
        duration: unit.duration,
      }));

    if (audioProgressData.length > 0) {
      audioPlayer.load(audioProgressData);
    }
  }
</script>

<div class="flex flex-col gap-y-3">
  <div class="px-2">
    <span class="text-xl font-semibold">Recently learned</span>
  </div>

  <div class="flex flex-col gap-y-4">
    {#each data.recentlyLearned as learningUnit (learningUnit.id)}
      <LearningUnit
        id={learningUnit.id}
        contentUrl={learningUnit.contentURL}
        to="/content/{learningUnit.id}"
        duration={learningUnit.duration}
        tags={learningUnit.tags}
        title={learningUnit.title}
        showplayerpanel
      />
    {/each}
  </div>
</div>
