<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  import FloatingChat from '$lib/components/FloatingChat.svelte';
  import FloatingPlayer from '$lib/components/FloatingPlayer.svelte';
  import LearningUnit from '$lib/components/LearningUnit.svelte';
  import { AudioState } from '$lib/helpers/index.js';

  let isModalOpen = $state(false);

  const audioState = AudioState.load();

  const handleFloatingPlayerClick = () => {
    isModalOpen = !isModalOpen;
  };

  const handlePlay = () => {
    audioState.isFloatingPlayerVisible = true;
    audioState.isPlaying = true;
  };

  const togglePlayPause = () => {
    audioState.isPlaying = !audioState.isPlaying;
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
      onplay={handlePlay}
    />

    <LearningUnit
      to="/content/1"
      tags={[{ variant: 'purple', content: 'Special Educational Needs' }]}
      title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
      showplayerpanel
      onplay={handlePlay}
    />
  </div>
</div>

<div class="z-100 pointer-events-none fixed inset-x-0 bottom-0">
  <div class="mx-auto max-w-5xl px-4 py-3">
    <div class="flex justify-end gap-x-4">
      {#if audioState.isFloatingPlayerVisible}
        <FloatingPlayer
          title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
          isplaying={audioState.isPlaying}
          onplay={togglePlayPause}
          onclick={handleFloatingPlayerClick}
        />
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
