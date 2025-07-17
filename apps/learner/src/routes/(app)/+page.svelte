<script lang="ts">
  import FloatingChat from '$lib/components/FloatingChat.svelte';
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

    <div class="z-100 pointer-events-none fixed inset-x-0 bottom-0">
      <div class="mx-auto max-w-5xl px-4">
        <div class="flex justify-end gap-x-4">
          {#if isFloatingPlayerVisible}
            <div class="pointer-events-auto mr-auto flex-grow overflow-x-hidden py-3">
              <FloatingPlayer
                to="/"
                title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
                isplaying={isPlaying}
                onplay={togglePlayPause}
              />
            </div>
          {/if}
          <div class="pointer-events-auto py-3">
            <FloatingChat to="/" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
