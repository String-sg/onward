<script lang="ts">
  import { LearningUnit } from '$lib/components/LearningUnit/index.js';
  import { tagCodeToBadgeVariant } from '$lib/helpers/index.js';
  import { Player } from '$lib/states/index.js';

  const { data } = $props();

  const player = Player.get();

  const handleLearningUnitPlay = (learningUnit: (typeof data.learningUnits)[0]) => {
    player.play({
      id: learningUnit.id,
      tags: learningUnit.tags,
      title: learningUnit.title,
      url: `/audio/${encodeURIComponent(learningUnit.url)}`,
    });
  };

  const handleLearningUnitPause = () => {
    player.toggle();
  };

  const handleLearningUnitResume = () => {
    player.toggle();
  };
</script>

<main class="pt-43 relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-3 px-4 pb-28">
  <div class="px-2">
    <span class="text-xl font-semibold">Recently learned</span>
  </div>

  <div class="flex flex-col gap-y-4">
    {#each data.learningUnits as learningUnit (learningUnit.id)}
      <LearningUnit
        to={`/content/${learningUnit.id}`}
        tags={learningUnit.tags.map((tag) => ({
          variant: tagCodeToBadgeVariant(tag.code),
          content: tag.label,
        }))}
        title={learningUnit.title}
        createdat={learningUnit.createdAt}
        createdby={learningUnit.createdBy}
        player={{
          isactive: player.currentTrack?.id === learningUnit.id,
          isplaying: player.isPlaying,
          onplay: () => handleLearningUnitPlay(learningUnit),
          onpause: handleLearningUnitPause,
          onresume: handleLearningUnitResume,
        }}
      />
    {/each}
  </div>
</main>
