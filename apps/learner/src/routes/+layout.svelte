<script lang="ts">
  import '../app.css';

  import FloatingPlayer from '$lib/components/FloatingPlayer.svelte';
  import { audioPlayer } from '$lib/stores/AudioPlayerStore.svelte';

  const { children } = $props();
</script>

{@render children()}

<!-- Global Floating Player -->
{#if audioPlayer.activeAudio.learningUnitId}
  <FloatingPlayer to="/" />
{/if}
