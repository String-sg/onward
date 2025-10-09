<script lang="ts">
  import { onMount } from 'svelte';

  import { LinkButton } from '$lib/components/Button/index.js';
  import { LearningUnit } from '$lib/components/LearningUnit/index.js';
  import { tagCodeToBadgeVariant } from '$lib/helpers/index.js';
  import { Player } from '$lib/states/index.js';

  const { data } = $props();

  interface ProgressEventDetail {
    currentTime: number;
    duration: number;
  }

  let progressState = $state(
    data.learningJourneys.map((lj) => {
      return {
        id: lj.learningUnit.id,
        contentDuration: lj.learningUnit.contentDuration,
        progress: 0,
      };
    }),
  );

  const player = Player.get();

  const handleLearningUnitPlay = (
    learningJourney: (typeof data.learningJourneys)[0],
    progress?: number,
  ) => {
    player.play(
      {
        id: learningJourney.learningUnit.id,
        tags: learningJourney.learningUnit.tags.map((t) => ({
          code: t.tag.code,
          label: t.tag.label,
        })),
        title: learningJourney.learningUnit.title,
        url: learningJourney.learningUnit.contentURL,
      },
      progress,
    );
  };

  const handleLearningUnitPause = () => {
    player.toggle();
  };

  const handleLearningUnitResume = () => {
    player.toggle();
  };

  onMount(() => {
    const onProgress = (event: CustomEvent<ProgressEventDetail>) => {
      const { currentTime } = event.detail;

      const currentState = progressState.find((ps) => ps.id === player.currentTrack?.id);
      if (!currentState) {
        return;
      }

      currentState.progress = currentTime;
    };

    player.addEventListener('progress', onProgress as EventListener);

    return () => {
      player.removeEventListener('progress', onProgress as EventListener);
    };
  });
</script>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-3 px-4 pt-43 pb-28">
  {#if data.learningJourneys.length > 0}
    <div class="px-2">
      <span class="text-xl font-semibold">Recently learned</span>
    </div>

    <div class="flex flex-col gap-y-4">
      {#each data.learningJourneys as learningJourney (learningJourney.id)}
        <LearningUnit
          to={`/unit/${learningJourney.learningUnit.id}`}
          tags={learningJourney.learningUnit.tags.map((t) => ({
            variant: tagCodeToBadgeVariant(t.tag.code),
            content: t.tag.label,
          }))}
          title={learningJourney.learningUnit.title}
          createdat={learningJourney.learningUnit.createdAt}
          createdby={learningJourney.learningUnit.createdBy}
          player={{
            isactive: player.currentTrack?.id === learningJourney.learningUnit.id,
            isplaying: player.isPlaying,
            onplay: () =>
              handleLearningUnitPlay(
                learningJourney,
                progressState.find((ps) => ps.id === learningJourney.learningUnit.id)?.progress,
              ),
            onpause: handleLearningUnitPause,
            onresume: handleLearningUnitResume,
            timeremaining: (() => {
              const ps = progressState.find((ps) => ps.id === learningJourney.learningUnit.id);
              return Math.max((ps?.contentDuration ?? 0) - (ps?.progress ?? 0), 0);
            })(),
          }}
        />
      {/each}
    </div>
  {:else}
    <div class="mt-20 flex flex-col items-center gap-y-8">
      <div class="flex flex-col items-center gap-y-6">
        <enhanced:img src="$lib/assets/fireworks.png?w=200" alt="No learning journey found" />

        <div class="flex flex-col items-center gap-y-2 text-center">
          <span class="text-2xl font-semibold">Welcome {data.username}</span>
          Kick off your learning journey by diving into our exciting curated content!
        </div>
      </div>

      <LinkButton href="/explore" width="full" class="max-w-md">Go to explore</LinkButton>
    </div>
  {/if}
</main>
