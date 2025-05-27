<script lang="ts">
  import { Home, Play, Search, Settings, Telescope } from '@lucide/svelte';

  let isPlayingBarVisible = $state(false);

  const handlePlayButton = () => {
    isPlayingBarVisible = !isPlayingBarVisible;
  };
</script>

<main
  class="[--navbar-height:64px] [--topbar-height:80px]"
  class:[--playingbar-height:64px]={isPlayingBarVisible}
>
  <div
    class="min-h-(--topbar-height) fixed left-0 right-0 top-0 z-10 flex items-center bg-white px-6"
  >
    <span class="text-xl font-semibold">Home</span>
  </div>

  <div
    class="mt-(--topbar-height) mb-[calc(var(--navbar-height)+var(--playingbar-height,0px))] px-6 py-4"
  >
    <div class="mb-4">
      <span class="text-lg font-semibold">Learning Now</span>
    </div>

    <div class="mb-4 flex justify-end rounded-lg border border-black p-5">
      <button onclick={handlePlayButton}>
        <Play />
      </button>
    </div>
    <div>
      Quisque pulvinar lacus non orci ullamcorper dignissim. Nam vehicula ex posuere sapien varius
      hendrerit. Mauris tincidunt magna ultrices, tincidunt nisi eu, scelerisque velit. Suspendisse
      laoreet nunc sem, in congue erat auctor eu. Quisque pulvinar lacus non orci ullamcorper
      dignissim. Nam vehicula ex posuere sapien varius hendrerit. Mauris tincidunt magna ultrices,
      tincidunt nisi eu, scelerisque velit. Suspendisse laoreet nunc sem, in congue erat auctor eu2.
      Quisque pulvinar lacus non orci ullamcorper dignissim. Nam vehicula ex posuere sapien varius
      hendrerit. Mauris tincidunt magna ultrices, tincidunt nisi eu, scelerisque velit. Suspendisse
      laoreet nunc sem, in congue erat auctor eu. Quisque pulvinar lacus non orci ullamcorper
      dignissim. Nam vehicula ex posuere sapien varius hendrerit. Mauris tincidunt magna ultrices,
      tincidunt nisi eu, scelerisque velit. Suspendisse laoreet nunc sem, in congue erat auctor eu2.
      Quisque pulvinar lacus non orci ullamcorper dignissim. Nam vehicula ex posuere sapien varius
      hendrerit. Mauris tincidunt magna ultrices, tincidunt nisi eu, scelerisque velit. Suspendisse
      laoreet nunc sem, in congue erat auctor eu. Quisque pulvinar lacus non orci ullamcorper
      dignissim. Nam vehicula ex posuere sapien varius hendrerit. Mauris tincidunt magna ultrices,
      tincidunt nisi eu, scelerisque velit. Suspendisse laoreet nunc sem, in congue erat auctor eu2.
      Quisque pulvinar lacus non orci ullamcorper dignissim. Nam vehicula ex posuere sapien varius
      hendrerit. Mauris tincidunt magna ultrices, tincidunt nisi eu, scelerisque velit. Suspendisse
      laoreet nunc sem, in congue erat auctor eu. Quisque pulvinar lacus non orci ullamcorper
      dignissim. Nam vehicula ex posuere sapien varius hendrerit. Mauris tincidunt magna ultrices,
      tincidunt nisi eu, scelerisque velit. Suspendisse laoreet nunc sem, in congue erat auctor eu2.
      Quisque pulvinar lacus non orci ullamcorper dignissim. Nam vehicula ex posuere sapien varius
      hendrerit. Mauris tincidunt magna ultrices, tincidunt nisi eu, scelerisque velit. Suspendisse
      laoreet nunc sem, in congue erat auctor eu. Quisque pulvinar lacus non orci ullamcorper
      dignissim. Nam vehicula ex posuere sapien varius hendrerit. Mauris tincidunt magna ultrices,
      tincidunt nisi eu, scelerisque velit. Suspendisse laoreet nunc sem, in congue erat auctor eu2.
      Quisque pulvinar lacus non orci ullamcorper dignissim. Nam vehicula ex posuere sapien varius
      hendrerit. Mauris tincidunt magna ultrices, tincidunt nisi eu, scelerisque velit. Suspendisse
      laoreet nunc sem, in congue erat auctor eu. Quisque pulvinar lacus non orci ullamcorper
      dignissim. Nam vehicula ex posuere sapien varius hendrerit. Mauris tincidunt magna ultrices,
      tincidunt nisi eu, scelerisque velit. Suspendisse laoreet nunc sem, in congue erat auctor eu2.
      Quisque pulvinar lacus non orci ullamcorper dignissim. Nam vehicula ex posuere sapien varius
      hendrerit. Mauris tincidunt magna ultrices, tincidunt nisi eu, scelerisque velit. Suspendisse
      laoreet nunc sem, in congue erat auctor eu. Quisque pulvinar lacus non orci ullamcorper
      dignissim. Nam vehicula ex posuere sapien varius hendrerit. Mauris tincidunt magna ultrices,
      tincidunt nisi eu, scelerisque velit. Suspendisse laoreet nunc sem, in congue erat auctor eu2.
      Quisque pulvinar lacus non orci ullamcorper dignissim. Nam vehicula ex posuere sapien varius
      hendrerit. Mauris tincidunt magna ultrices, tincidunt nisi eu, scelerisque velit. Suspendisse
      laoreet nunc sem, in congue erat auctor eu. Quisque pulvinar lacus non orci ullamcorper
      dignissim. Nam vehicula ex posuere sapien varius hendrerit. Mauris tincidunt magna ultrices,
      tincidunt nisi eu, scelerisque velit. Suspendisse laoreet nunc sem, in congue erat auctor eu2.
      Quisque pulvinar lacus non orci ullamcorper dignissim. Nam vehicula ex posuere sapien varius
      hendrerit. Mauris tincidunt magna ultrices, tincidunt nisi eu, scelerisque velit. Suspendisse
      laoreet nunc sem, in congue erat auctor eu. Quisque pulvinar lacus non orci ullamcorper
      dignissim. Nam vehicula ex posuere sapien varius hendrerit. Mauris tincidunt magna ultrices,
      tincidunt nisi eu, scelerisque velit. Suspendisse laoreet nunc sem, in congue erat auctor eu2.
      Quisque pulvinar lacus non orci ullamcorper dignissim. Nam vehicula ex posuere sapien varius
      hendrerit. Mauris tincidunt magna ultrices, tincidunt nisi eu, scelerisque velit. Suspendisse
      laoreet nunc sem, in congue erat auctor eu. Quisque pulvinar lacus non orci ullamcorper
      dignissim. Nam vehicula ex posuere sapien varius hendrerit. Mauris tincidunt magna ultrices,
      tincidunt nisi eu, scelerisque velit. Suspendisse laoreet nunc sem, in congue erat auctor eu2.
    </div>
  </div>

  <div class="fixed bottom-0 left-0 right-0 z-10">
    {#if isPlayingBarVisible}
      <div
        class="min-h-(--playingbar-height) flex items-center justify-between border-t bg-black px-6"
      >
        <div class="flex items-center gap-x-2">
          <div class="flex h-10 w-10 items-center justify-center bg-gray-200">IMG</div>
          <span class="text-white">Title of the content</span>
        </div>

        <div class="flex h-10 w-10 items-center justify-center text-white">
          <Play />
        </div>
      </div>
    {/if}

    <div class="min-h-(--navbar-height) flex items-center border-t bg-white">
      <div class="flex flex-1 justify-center"><Home /></div>
      <div class="flex flex-1 justify-center"><Search /></div>
      <div class="flex flex-1 justify-center"><Telescope /></div>
      <div class="flex flex-1 justify-center"><Settings /></div>
    </div>
  </div>
</main>
