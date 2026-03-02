<script lang="ts">
  import { EmptyStateView } from '$lib/components/EmptyStateView/index.js';
  import { LearningUnit } from '$lib/components/LearningUnit';

  const { data } = $props();
</script>

<main class="relative mx-auto flex min-h-svh max-w-5xl flex-col gap-y-3 px-4 pt-43 pb-28">
  {#if data.journeys.inProgress.length > 0}
    <div class="flex flex-col gap-y-3">
      <div class="px-2">
        <span class="text-xl font-medium">In Progress</span>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        {#each data.journeys.inProgress as journey (journey.id)}
          <LearningUnit
            to="/unit/{journey.unitId}"
            tags={journey.tags}
            title={journey.title}
            createdat={journey.createdAt}
            createdby={journey.createdBy}
            status={journey.status}
          />
        {/each}
      </div>
    </div>
  {/if}

  {#if data.journeys.isCompleted.length > 0}
    <div class="flex flex-col gap-y-3">
      <div class="px-2">
        <span class="text-xl font-medium">Completed</span>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        {#each data.journeys.isCompleted as journey (journey.id)}
          <LearningUnit
            to="/unit/{journey.unitId}"
            tags={journey.tags}
            title={journey.title}
            createdat={journey.createdAt}
            createdby={journey.createdBy}
          />
        {/each}
      </div>
    </div>
  {/if}

  {#if data.journeys.inProgress.length === 0 && data.journeys.isCompleted.length === 0}
    <div class="mt-8 flex flex-col items-center gap-y-5">
      <EmptyStateView username={data.username} imagealt="No learning journeys found" />
    </div>
  {/if}
</main>
