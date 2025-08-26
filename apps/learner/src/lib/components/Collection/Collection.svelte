<script lang="ts">
  export type Variant = 'purple' | 'teal' | 'amber';

  import { Badge } from '$lib/components/Badge/index.js';

  export interface Props {
    /**
     * The URL to navigate to when clicking the collection.
     */
    to: string;
    /**
     * The tag to display on the collection.
     */
    tag: string;
    /**
     * The title of the collection.
     */
    title: string;
    /**
     * Total number of podcasts in this collection.
     */
    numberofpodcasts: number;
    /**
     * Total number of notes in this collection.
     */
    numberofnotes: number;
    /**
     * Visual colour theme for the collection.
     */
    variant: Variant;
  }

  let { to, tag, title, numberofpodcasts, numberofnotes, variant }: Props = $props();
</script>

<a href={to} class={['shadow-xs flex flex-col gap-y-2 rounded-3xl bg-white bg-gradient-to-b p-6']}>
  <div class="flex flex-col gap-y-8">
    <div class="flex justify-center">
      {#if variant === 'purple'}
        <enhanced:img src="$lib/assets/jupiter.png?w=200" alt={`${title}`} />
      {:else if variant === 'amber'}
        <enhanced:img src="$lib/assets/stars.png?w=200" alt={`${title}`} />
      {:else if variant === 'teal'}
        <enhanced:img src="$lib/assets/saturn.png?w=200" alt={`${title}`} />
      {/if}
    </div>

    <div class="flex flex-col gap-y-2">
      <div class="flex flex-col gap-y-1">
        <Badge {variant}>{tag}</Badge>

        <span class={['text-xl font-semibold text-slate-900']}>
          {title}
        </span>
      </div>

      <div class="flex flex-col">
        <span class="text-sm text-slate-900">{numberofpodcasts} podcasts</span>
        <span class="text-sm text-slate-900">{numberofnotes} notes</span>
      </div>
    </div>
  </div>
</a>
