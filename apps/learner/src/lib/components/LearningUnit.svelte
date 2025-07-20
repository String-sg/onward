<script lang="ts">
  import { Pause, Play } from '@lucide/svelte';

  import Badge, { type Variant as BadgeVariant } from '$lib/components/Badge.svelte';
  import { audioPlayer } from '$lib/stores/AudioPlayerStore.svelte';

  interface Props {
    /**
     * The URL to navigate to when the user clicks on the MLU.
     */
    to: string;
    /**
     * The tags to display on the MLU.
     */
    tags: { variant: BadgeVariant; content: string }[];
    /**
     * The title of the MLU.
     */
    title: string;
    /**
     * The unique identifier for the audio content.
     */
    id: number;
    /**
     * The URL of the audio file.
     */
    contentUrl: string;
    /**
     * Duration of the audio in seconds.
     */
    duration?: number;
    /**
     * A flag to display the panel containing the Play button and progress indicator.
     */
    showplayerpanel?: boolean;
  }

  let { to, title, tags, showplayerpanel = false, id, contentUrl, duration }: Props = $props();

  let timeLeft = $derived(audioPlayer.getTimeLeft(id, duration));
  let progressPercentage = $derived(audioPlayer.getProgressPercent(id, duration));
  let button = $derived(audioPlayer.getButtonState(id));

  const handlePlay = async (event: Event) => {
    event.preventDefault();

    if (audioPlayer.isCurrentlyPlaying(id)) {
      audioPlayer.pauseAudio();
    } else {
      const resumeTime = audioPlayer.getResumeTime(id);
      await audioPlayer.playAudio(id, contentUrl, title, resumeTime);
    }
  };
</script>

<a href={to} class="shadow-xs flex flex-col gap-y-6 rounded-3xl bg-white p-6">
  <div class="flex flex-col gap-y-2">
    <div class="flex flex-wrap gap-1">
      {#each tags as tag (tag.content)}
        <Badge variant={tag.variant}>{tag.content}</Badge>
      {/each}
    </div>

    <div class="flex flex-col gap-y-3">
      <span class="text-xl font-medium text-slate-950">
        {title}
      </span>

      <div class="flex gap-x-1">
        <span class="text-sm text-slate-600">Guidance Branch</span>
        <span class="text-sm text-slate-600">•</span>
        <span class="text-sm text-slate-600">2 days ago</span>
      </div>
    </div>
  </div>

  {#if showplayerpanel}
    <div class="flex items-center justify-between">
      <button
        class="flex cursor-pointer items-center gap-x-2 rounded-full bg-slate-100 px-6 py-4 transition-colors hover:bg-slate-200"
        onclick={handlePlay}
      >
        {#if button.showPause}
          <Pause />
        {:else}
          <Play />
        {/if}
        <span class="font-medium text-slate-950">{button.text}</span>
      </button>

      <div class="flex items-center gap-x-2">
        <span class="text-sm text-slate-600">{timeLeft}</span>

        <svg viewBox="0 0 24 24" class="h-6 w-6">
          <circle cx="12" cy="12" r="9" stroke="#E2E8F0" fill="none" stroke-width="3px" />
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="#020617"
            fill="none"
            stroke-width="3px"
            stroke-dasharray="56.55"
            stroke-dashoffset={56.55 - (56.55 * progressPercentage) / 100}
            transform-origin="center"
            transform="rotate(-90 0 0)"
          />
        </svg>
      </div>
    </div>
  {/if}
</a>
