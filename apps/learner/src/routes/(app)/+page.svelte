<script lang="ts">
  import LearningUnit from '$lib/components/LearningUnit.svelte';
  import { AudioState } from '$lib/helpers/index.js';

  const audioState = AudioState.load();

  const currentPlayingId = $derived(
    audioState.isPlaying ? audioState.currentLearningUnit?.id : null,
  );

  const handlePlay = (learningUnit: { id: number; title: string }) => {
    if (currentPlayingId === learningUnit.id) {
      audioState.pause();
    } else {
      audioState.play(learningUnit);
    }
  };
</script>

<div class="flex flex-col gap-y-3">
  <div class="px-2">
    <span class="text-xl font-semibold">Recently learned</span>
  </div>

  <div class="flex flex-col gap-y-4">
    <LearningUnit
      to="/content/1"
      tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
      title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
      showplayerpanel
      isplaying={currentPlayingId === 1 && audioState.isPlaying}
      onplay={() =>
        handlePlay({
          id: 1,
          title: 'Navigating Special Educational Needs in Singapore: A Path to Inclusion',
        })}
    />

    <LearningUnit
      to="/content/2"
      tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
      title="Testing the Waters: A Guide to Special Educational Needs in Singapore"
      showplayerpanel
      isplaying={currentPlayingId === 2}
      onplay={() =>
        handlePlay({
          id: 2,
          title: 'Testing the Waters: A Guide to Special Educational Needs in Singapore',
        })}
    />
  </div>
</div>
