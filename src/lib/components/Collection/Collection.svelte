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
    type: 'SPECIAL_EDUCATIONAL_NEEDS' | 'LEARN_ABOUT_AI' | 'INNOVATION' | 'LEARN_WITH_BOB';
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
        <enhanced:img src="$lib/assets/jupiter.png?w=200" alt={title} />
      {:else if type === 'LEARN_ABOUT_AI'}
        <enhanced:img src="$lib/assets/stars.png?w=200" alt={title} />
      {:else if type === 'INNOVATION'}
        <enhanced:img src="$lib/assets/jupiter.png?w=200" alt={title} />
      {:else if type === 'LEARN_WITH_BOB'}
        <enhanced:img src="$lib/assets/stars.png?w=200" alt={title} />
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
