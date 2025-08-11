<script lang="ts">
  import { LearningUnit } from '$lib/components/LearningUnit/index.js';
  import { Player } from '$lib/states/index.js';

  const { data } = $props();

  const player = Player.get();

  const handleLearningUnitPlay = (learningUnit: (typeof data.learningUnits)[0]) => {
    player.play({
      id: learningUnit.id,
      title: learningUnit.title,
    });
  };

  const handleLearningUnitPause = () => {
    player.toggle();
  };

  const handleLearningUnitResume = () => {
    player.toggle();
  };
</script>

<div class="flex flex-col gap-y-3">
  <div class="px-2">
    <span class="text-xl font-semibold">Recently learned</span>
  </div>

  <div class="flex flex-col gap-y-4">
    {#each data.learningUnits as learningUnit (learningUnit.id)}
      <LearningUnit
        to={`/content/${learningUnit.id}`}
        tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
        title={learningUnit.title}
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
</div>
