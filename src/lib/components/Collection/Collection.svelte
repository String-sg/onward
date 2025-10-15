<script lang="ts">
  import { Badge, type BadgeProps } from '$lib/components/Badge/index.js';

  export interface Props {
    /**
     * The URL to navigate to when clicking the collection.
     */
    to: string;
    /**
     * The tags to display on the collection.
     */
    tags: { variant: BadgeProps['variant']; content: string }[];
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
      | 'SPECIAL_EDUCATIONAL_NEEDS'
      | 'LEARN_ABOUT_AI'
      | 'LEARN_TO_USE_AI'
      | 'INNOVATION'
      | 'LEARN_WITH_BOB'
      | 'STUDENT_WELLBEING'
      | 'STAFF_WELLBEING'
      | 'NEWS';
  }

  let { to, tags, title, numberofpodcasts, type }: Props = $props();
</script>

<a
  href={to}
  class="flex flex-col gap-y-2 rounded-3xl bg-white bg-gradient-to-b p-6 shadow-xs transition-shadow hover:ring-1 hover:ring-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
>
  <div class="flex flex-col gap-y-8">
    <div class="flex justify-center">
      {#if type === 'SPECIAL_EDUCATIONAL_NEEDS'}
        <enhanced:img
          src="$lib/assets/collections/special-educational-needs.png?w=200"
          alt={title}
        />
      {:else if type === 'LEARN_ABOUT_AI'}
        <enhanced:img src="$lib/assets/collections/learn-about-ai.png?w=200" alt={title} />
      {:else if type === 'LEARN_TO_USE_AI'}
        <enhanced:img src="$lib/assets/collections/learn-to-use-ai.png?w=200" alt={title} />
      {:else if type === 'INNOVATION'}
        <enhanced:img src="$lib/assets/collections/innovation.png?w=200" alt={title} />
      {:else if type === 'LEARN_WITH_BOB'}
        <enhanced:img src="$lib/assets/collections/learn-with-bob.png?w=200" alt={title} />
      {:else if type === 'STUDENT_WELLBEING'}
        <enhanced:img src="$lib/assets/collections/student-wellbeing.png?w=200" alt={title} />
      {:else if type === 'STAFF_WELLBEING'}
        <enhanced:img src="$lib/assets/collections/staff-wellbeing.png?w=200" alt={title} />
      {:else if type === 'NEWS'}
        <enhanced:img src="$lib/assets/collections/news.png?w=200" alt={title} />
      {/if}
    </div>

    <div class="flex flex-col gap-y-2">
      <div class="flex flex-col gap-y-1">
        {#each tags as tag (tag.content)}
          <Badge variant={tag.variant}>{tag.content}</Badge>
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
