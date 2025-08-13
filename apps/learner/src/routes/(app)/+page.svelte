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

  let currentValue = $state(0); // Slider's current value
  const maxValue = 300; // Maximum value (e.g., total duration in seconds)

  // Format seconds as mm:ss
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleValueChange = (value: number) => {
    currentValue = value; // Update the current value as the slider moves
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
