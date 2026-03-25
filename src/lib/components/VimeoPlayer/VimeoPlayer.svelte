<script lang="ts">
  import type { VimeoUrl } from '@vimeo/player';
  import type Player from '@vimeo/player';
  import { onMount } from 'svelte';

  interface Props {
    url: string;
    startTime?: number;
    active?: boolean;
    ontimeupdate?: (percent: number) => void;
    onended?: () => void;
    oncheckpoint?: (currentTime: number) => void;
    onpause?: (currentTime: number) => void;
  }

  const {
    url,
    startTime,
    active = true,
    ontimeupdate,
    onended,
    oncheckpoint,
    onpause,
  }: Props = $props();

  let container: HTMLDivElement | null = null;
  let playerInstance: Player | null = $state(null);

  onMount(() => {
    if (!container) {
      return;
    }

    let unmounted = false;
    let player: Player | null = null;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let isPlaying = false;
    let isTrackingSession = false;
    let accumulatedTime = 0;
    let lastTick = Date.now();

    import('@vimeo/player').then(({ default: Player }) => {
      if (unmounted || !container) {
        return;
      }

      player = new Player(container, {
        url: url as VimeoUrl,
        responsive: true,
        autoplay: true,
        title: false,
        byline: false,
        portrait: false,
        vimeo_logo: false,
      });
      playerInstance = player;

      player.on('loaded', () => {
        if (!player) {
          return;
        }

        if (startTime && startTime > 0) {
          player.setCurrentTime(startTime);
        }
      });

      player.on('timeupdate', ({ percent }: { percent: number }) => {
        if (ontimeupdate) {
          ontimeupdate(percent * 100);
        }
      });

      player.on('ended', () => {
        if (onended) {
          onended();
        }
      });

      player.on('play', () => {
        isPlaying = true;
        lastTick = Date.now();

        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        intervalId = setInterval(async () => {
          if (!isPlaying || !player) {
            return;
          }

          const now = Date.now();
          accumulatedTime += (now - lastTick) / 1000;
          lastTick = now;
          if (accumulatedTime >= 10) {
            accumulatedTime = 0;
            isTrackingSession = true;
            const currentTime = await player.getCurrentTime();
            if (oncheckpoint) {
              oncheckpoint(currentTime);
            }
          }
        }, 1000);
      });

      player.on('pause', async () => {
        isPlaying = false;
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        if (!isTrackingSession) {
          return;
        }
        if (player && onpause) {
          const currentTime = await player.getCurrentTime();
          onpause(currentTime);
        }
      });
    });

    return () => {
      unmounted = true;
      isPlaying = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (player) {
        player.destroy();
      }
      playerInstance = null;
    };
  });

  $effect(() => {
    if (playerInstance) {
      if (active) {
        void playerInstance.play();
      } else {
        playerInstance.pause();
      }
    }
  });
</script>

<div bind:this={container} class="w-full"></div>
