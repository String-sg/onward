<script lang="ts">
  import { Collection } from '$lib/components/Collection/index.js';
  import { CollectionCard } from '$lib/components/CollectionCard/index.js';
  import { EmptyStateView } from '$lib/components/EmptyStateView/index.js';
  import { LearningUnit } from '$lib/components/LearningUnit/index.js';
  import { Player } from '$lib/states/index.js';

  const { data } = $props();

  const player = Player.get();

  const handleLearningUnitPlay = (
    item: (typeof data.learningJourneys)[0] | (typeof data.recommendedLearningUnits)[0],
  ) => {
    const learningUnit = 'learningUnit' in item ? item.learningUnit : item;
    const lastCheckpoint = 'lastCheckpoint' in item ? item.lastCheckpoint : undefined;

    player.play(
      {
        id: learningUnit.id,
        tags: learningUnit.tags,
        title: learningUnit.title,
        summary: learningUnit.summary,
        url: learningUnit.contents?.[0]?.url ?? '',
      },
      lastCheckpoint,
    );
  };

  const handleLearningUnitPause = () => {
    player.toggle();
  };

  const handleLearningUnitResume = () => {
    player.toggle();
  };
</script>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-4 px-4 pt-43 pb-28">
  <!-- Collections -->
  {#if data.collections.length > 0}
    <div class="flex items-center justify-between px-2">
      <span class="text-xl font-semibold">Collections</span>

      <a
        href="/collections"
        class="rounded-2xl px-4 py-2 text-sm font-medium hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
      >
        See all
      </a>
    </div>

    {#each data.collections as collection (collection.id)}
      <CollectionCard
        to={`/collection/${collection.id}`}
        title={collection.title}
        numberofbites={collection.numberOfBites}
        dueDate={collection.dueDate ?? undefined}
      />
    {/each}
  {/if}

  <!-- Recommended Bites -->
  {#if data.recommendedLearningUnits.length > 0}
    <div class="flex items-center justify-between px-2">
      <span class="text-xl font-semibold">Recommended bites</span>

      <a
        href="/bites"
        class="rounded-2xl px-4 py-2 text-sm font-medium hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
      >
        See all
      </a>
    </div>

    <div class="flex flex-col gap-y-4">
      {#each data.recommendedLearningUnits as learningUnit (learningUnit.id)}
        <LearningUnit
          to={`/unit/${learningUnit.id}`}
          tags={learningUnit.tags}
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
          status={learningUnit.status}
        />
      {/each}
    </div>
  {/if}

  <!-- Recently Learned -->
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
          tags={learningJourney.learningUnit.tags}
          title={learningJourney.learningUnit.title}
          createdat={learningJourney.learningUnit.createdAt}
          createdby={learningJourney.learningUnit.createdBy}
          player={{
            isactive: player.currentTrack?.id === learningJourney.learningUnit.id,
            isplaying: player.isPlaying,
            onplay: () => handleLearningUnitPlay(learningJourney),
            onpause: handleLearningUnitPause,
            onresume: handleLearningUnitResume,
            lastcheckpoint: learningJourney.lastCheckpoint,
          }}
          status={learningJourney.learningUnit.status}
        />
      {/each}
    </div>
  {/if}

  <!-- Learning Topics -->
  {#if data.topics.some((topic) => topic.numberOfBites > 0)}
    <div class="flex flex-row justify-between px-2">
      <span class="text-xl font-semibold">Learning topics</span>
    </div>

    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      {#each data.topics as topic (topic.id)}
        {#if topic.numberOfBites > 0}
          <Collection
            to="/collection/{topic.id}"
            title={topic.title}
            type={topic.tag?.code ?? ''}
            numberofbites={topic.numberOfBites}
          />
        {/if}
      {/each}
    </div>
  {/if}

  {#if data.recommendedLearningUnits.length === 0 && data.learningJourneys.length === 0 && data.collections.length === 0 && data.topics.every((topic) => topic.numberOfBites === 0)}
    <div class="mt-8 flex flex-col items-center gap-y-5">
      <EmptyStateView username={data.username} imagealt="No bites found" />
    </div>
  {/if}
</main>
