<script lang="ts">
  import { Badge } from '$lib/components/Badge/index.js';
  import { tagCodeToBadgeVariant } from '$lib/helpers/index.js';

  export interface Props {
    /**
     * The URL to navigate to when clicking the collection.
     */
    to: string;
    /**
     * The tags to display on the collection.
     */
    tags: { code: string; label: string }[];
    /**
     * The title of the collection.
     */
    title: string;
    /**
     * Total number of podcasts in this collection.
     */
    numberofpodcasts: number;
    /**
     * Defines the visual theme and icon for the collection.
     */
    type:
      | 'AI'
      | 'BOB'
      | 'CAREER'
      | 'INNOV'
      | 'NEWS'
      | 'PROD'
      | 'STU_DEV'
      | 'STU_WELL'
      | 'WELLBEING';
  }

  let { to, tags, title, numberofpodcasts, type }: Props = $props();
</script>

<a
  href={to}
  class="flex flex-col gap-y-2 rounded-3xl bg-white bg-gradient-to-b p-6 shadow-xs transition-shadow hover:ring-1 hover:ring-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
>
  <div class="flex flex-col gap-y-8">
    <div class="flex justify-center">
      {#if type === 'AI'}
        <enhanced:img src="$lib/assets/collections/ai.png?w=200" alt={title} />
      {:else if type === 'BOB'}
        <enhanced:img src="$lib/assets/collections/bob.png?w=200" alt={title} />
      {:else if type === 'CAREER'}
        <enhanced:img src="$lib/assets/collections/news.png?w=200" alt={title} />
      {:else if type === 'INNOV'}
        <enhanced:img src="$lib/assets/collections/innov.png?w=200" alt={title} />
      {:else if type === 'NEWS'}
        <enhanced:img src="$lib/assets/collections/news.png?w=200" alt={title} />
      {:else if type === 'PROD'}
        <enhanced:img src="$lib/assets/collections/news.png?w=200" alt={title} />
      {:else if type === 'STU_DEV'}
        <enhanced:img src="$lib/assets/collections/stu-dev.png?w=200" alt={title} />
      {:else if type === 'STU_WELL'}
        <enhanced:img src="$lib/assets/collections/stu-well.png?w=200" alt={title} />
      {:else if type === 'WELLBEING'}
        <enhanced:img src="$lib/assets/collections/wellbeing.png?w=200" alt={title} />
      {/if}
    </div>

    <div class="flex flex-col gap-y-2">
      <div class="flex flex-col gap-y-1">
        {#each tags as tag (tag.label)}
          <Badge variant={tagCodeToBadgeVariant(tag.code)}>{tag.label}</Badge>
        {/each}

        <span class="text-xl font-semibold">
          {title}
        </span>
      </div>

      <div class="flex flex-col">
        <span class="text-sm">
          {numberofpodcasts}&nbsp;{numberofpodcasts === 1 ? 'podcast' : 'podcasts'}
        </span>
      </div>
    </div>
  </div>
</a>
