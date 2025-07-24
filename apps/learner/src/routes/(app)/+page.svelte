<script lang="ts">
  import { ArrowLeft } from '@lucide/svelte';

  import FloatingChat from '$lib/components/FloatingChat.svelte';
  import FloatingPlayer from '$lib/components/FloatingPlayer.svelte';
  import LearningUnit from '$lib/components/LearningUnit.svelte';

  let isFloatingPlayerVisible = $state(false);
  let isPlaying = $state(false);
  let isModalOpen = $state(false);

  const handlePlay = () => {
    isFloatingPlayerVisible = true;
    isPlaying = true;
  };

  const togglePlayPause = () => {
    isPlaying = !isPlaying;
  };

  const openModal = () => {
    isModalOpen = true;
  };

  const closeModal = () => {
    isModalOpen = false;
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
  <div class="mx-auto max-w-5xl px-4">
    <div class="flex justify-end gap-x-4">
      {#if isFloatingPlayerVisible}
        <div class="pointer-events-auto flex-grow overflow-x-hidden py-3">
          <FloatingPlayer
            title="Navigating Special Educational Needs in Singapore: A Path to Inclusion"
            isplaying={isPlaying}
            onplay={togglePlayPause}
            onclick={openModal}
          />
        </div>
      {/if}
      <div class="pointer-events-auto py-3">
        <FloatingChat />
      </div>
    </div>
  </div>
</div>

{#if isModalOpen}
  <div class="z-200 fixed inset-0 bg-slate-950">
    <!-- Modal Header -->
    <header class="flex items-center px-4 py-3">
      <button class="rounded-full p-4 transition-colors hover:bg-white/20" onclick={closeModal}>
        <ArrowLeft class="text-white" />
      </button>
    </header>
  </div>
{/if}
