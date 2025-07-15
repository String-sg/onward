<script lang="ts">
  import FloatingPlayer from '$lib/components/FloatingPlayer.svelte';
  import LearningUnit from '$lib/components/LearningUnit.svelte';

  let isFloatingPlayerVisible = $state(false);
  let isPlaying = $state(false);

  function handlePlay() {
    isFloatingPlayerVisible = true;
    isPlaying = true;
  }

  function togglePlayPause() {
    isPlaying = !isPlaying;
  }
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
      onplay={handlePlay}
    />

    <LearningUnit
      to="/content/1"
      tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
      title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
      showplayerpanel
      onplay={handlePlay}
    />

    {#if isFloatingPlayerVisible}
      <FloatingPlayer
        to="/"
        title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
        isplaying={isPlaying}
        onplay={togglePlayPause}
      />
    {/if}
  </div>
</div>
