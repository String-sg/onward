<script lang="ts">
  import { LinkButton } from '$lib/components/Button/index.js';
  import { LearningUnit } from '$lib/components/LearningUnit/index.js';
  import { tagCodeToBadgeVariant } from '$lib/helpers/index.js';
  import { Player } from '$lib/states/index.js';

  const { data } = $props();

  const player = Player.get();

  const handleLearningUnitPlay = (
    item: (typeof data.learningJourneys)[0] | (typeof data.recommendedLearningUnits)[0],
  ) => {
    const learningUnit = 'learningUnit' in item ? item.learningUnit : item;

    player.play({
      id: learningUnit.id,
      tags: learningUnit.tags.map((t) => ({
        code: t.tag.code,
        label: t.tag.label,
      })),
      title: learningUnit.title,
      summary: learningUnit.summary,
      url: learningUnit.contentURL,
    });
  };

  const handleLearningUnitPause = () => {
    player.toggle();
  };

  const handleLearningUnitResume = () => {
    player.toggle();
  };
</script>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-4 px-4 pt-43 pb-28">
  {#if data.learningJourneys.length > 0}
    <div class="flex items-center justify-between px-2">
      <span class="text-xl font-semibold">Recently learned</span>

      <a
        href="/learning"
        class="rounded-2xl px-4 py-2 text-sm font-medium hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
      >
        See all
      </a>
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
            onplay: () => handleLearningUnitPlay(learningJourney),
            onpause: handleLearningUnitPause,
            onresume: handleLearningUnitResume,
          }}
        />
      {/each}
    </div>
  {/if}

  {#if data.recommendedLearningUnits.length > 0}
    <div class="flex items-center justify-between px-2">
      <span class="text-xl font-semibold">Recommended for you</span>

      <a
        href="/explore"
        class="rounded-2xl px-4 py-2 text-sm font-medium hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
      >
        See all
      </a>
    </div>

    <div class="flex flex-col gap-y-4">
      {#each data.recommendedLearningUnits as learningUnit (learningUnit.id)}
        <LearningUnit
          to={`/unit/${learningUnit.id}`}
          tags={learningUnit.tags.map((t) => ({
            variant: tagCodeToBadgeVariant(t.tag.code),
            content: t.tag.label,
          }))}
          title={learningUnit.title}
          createdat={learningUnit.createdAt}
          createdby={learningUnit.createdBy}
          player={{
            isactive: player.currentTrack?.id === learningUnit.id,
            isplaying: player.isPlaying,
            onplay: () => handleLearningUnitPlay(learningUnit),
            onpause: handleLearningUnitPause,
            onresume: handleLearningUnitResume,
          }}
        />
      {/each}
    </div>
  {/if}

  {#if data.recommendedLearningUnits.length === 0 && data.learningJourneys.length === 0}
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
