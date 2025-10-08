<script lang="ts">
  import { LinkButton } from '$lib/components/Button/index.js';
  import { LearningUnit } from '$lib/components/LearningUnit/index.js';
  import { tagCodeToBadgeVariant } from '$lib/helpers/index.js';
  import { Player } from '$lib/states/index.js';

  const { data } = $props();

  const player = Player.get();

  const handleLearningUnitPlay = (learningUnit: (typeof data.learningUnits)[0]) => {
    player.play({
      id: learningUnit.id,
      tags: learningUnit.tags.map((t) => ({
        code: t.tag.code,
        label: t.tag.label,
      })),
      title: learningUnit.title,
      url: `/audio/${encodeURIComponent(learningUnit.contentURL)}`,
    });
  };

  const handleLearningUnitPause = () => {
    player.toggle();
  };

  const handleLearningUnitResume = () => {
    player.toggle();
  };
</script>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-3 px-4 pt-43 pb-28">
  {#if data.learningUnits && data.learningUnits.length > 0}
    <div class="px-2">
      <span class="text-xl font-semibold">Recently learned</span>
    </div>

    <div class="flex flex-col gap-y-4">
      {#each data.learningUnits as learningUnit (learningUnit.id)}
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
  {:else}
    <div class="mt-20 flex flex-col items-center gap-y-8">
      <div class="flex flex-col items-center gap-y-6">
        <enhanced:img src="$lib/assets/fireworks.png?w=200" alt="No learning journey found" />

        <div class="flex flex-col items-center gap-y-2">
          <span class="text-2xl font-semibold">Welcome {data.username}</span>
          Kick off your learning journey by diving into our existing curated content!
        </div>
      </div>

      <LinkButton href="/explore" width="full" class="max-w-md">Go to explore</LinkButton>
    </div>
  {/if}
</main>
