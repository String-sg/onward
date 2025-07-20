<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';

  import { audioPlayer } from '$lib/stores/AudioPlayerStore.svelte';

  interface Props {
    /**
     * The URL to navigate to when the user clicks on the floating player.
     */
    to: string;
    /**
     * A callback function that is called when the user clicks on the play button.
     */
    onplay?: () => void;
  }

  let { to, onplay }: Props = $props();

  let isCurrentlyPlaying = $derived(audioPlayer.activeAudio.status === 'playing');

  const handlePlay = async (event: Event) => {
    event.preventDefault();

    const learningUnitId = audioPlayer.activeAudio.learningUnitId;

    if (isCurrentlyPlaying) {
      audioPlayer.pauseAudio();
    } else if (audioPlayer.activeAudio.contentUrl && learningUnitId) {
      const resumeTime = audioPlayer.getResumeTime(learningUnitId);
      await audioPlayer.playAudio(
        learningUnitId,
        audioPlayer.activeAudio.contentUrl,
        audioPlayer.activeAudio.title || undefined,
        resumeTime,
      );
    }
    onplay?.();
  };
</script>

<div class="z-100 fixed bottom-6 left-6 right-6">
  <a
    href={to}
    class="inset-shadow-sm flex items-center gap-x-3 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm"
  >
    <!-- Temporary album placeholder -->
    <div class="h-12 w-12 rounded-full bg-black"></div>

    <div class="flex-1 truncate text-sm font-medium">
      {audioPlayer.activeAudio.title || 'Untitled Audio'}
    </div>

    <button
      class="flex cursor-pointer items-center rounded-full px-4 py-2 hover:bg-slate-50"
      onclick={handlePlay}
    >
      {#if isCurrentlyPlaying}
        <Pause />
      {:else}
        <Play />
      {/if}
    </button>
  </a>
</div>
