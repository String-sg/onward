<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  import FloatingChat from '$lib/components/FloatingChat.svelte';
  import FloatingPlayer from '$lib/components/FloatingPlayer.svelte';
  import LearningUnit from '$lib/components/LearningUnit.svelte';
  import { AudioState } from '$lib/helpers/index.js';

  let isModalOpen = $state(false);

  const audioState = AudioState.load();

  const currentPlayingId = $derived(
    audioState.isPlaying ? audioState.currentLearningUnit?.id : null,
  );

  const handleFloatingPlayerClick = () => {
    isModalOpen = !isModalOpen;
  };

  const handlePlay = (learningUnit: { id: number; title: string }) => {
    if (currentPlayingId === learningUnit.id) {
      audioState.pause();
    } else {
      audioState.play(learningUnit);
    }
  };

  const handleResume = () => {
    if (audioState.isPlaying) {
      audioState.pause();
    } else {
      audioState.resume();
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

<div class="z-100 pointer-events-none fixed inset-x-0 bottom-0">
  <div class="mx-auto max-w-5xl px-4 py-3">
    <div class="flex justify-end gap-x-4">
      {#if audioState.isFloatingPlayerVisible}
        <div class="pointer-events-auto flex-grow overflow-x-hidden py-3">
          <FloatingPlayer
            title={audioState.currentLearningUnit?.title}
            isplaying={audioState.isPlaying}
            onplay={handleResume}
            onclick={handleFloatingPlayerClick}
          />
        </div>
      {/if}

      <FloatingChat />
    </div>
  </div>
</div>

{#if isModalOpen}
  <div class="z-200 fixed inset-0 bg-slate-950">
    <div class="mx-auto w-full max-w-5xl px-4 py-3">
      <!-- Modal Header -->
      <header class="flex items-center">
        <button
          class="rounded-full p-4 transition-colors hover:bg-white/20"
          onclick={handleFloatingPlayerClick}
        >
          <ArrowLeft class="text-white" />
        </button>
      </header>
    </div>
  </div>
{/if}
