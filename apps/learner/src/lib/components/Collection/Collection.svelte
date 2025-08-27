<script lang="ts">
  import { Badge } from '$lib/components/Badge/index.js';

  type Type = 'ai' | 'sen' | 'mentalHealth';
  type Variant = 'purple' | 'teal' | 'amber';

  const colors: Record<Type, Variant> = {
    ai: 'amber',
    sen: 'purple',
    mentalHealth: 'teal',
  };

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
     * Defines the visual theme and icon for the collection.
     */
    type: Type;
  }

  let { to, tag, title, numberofpodcasts, numberofnotes, type }: Props = $props();
</script>

<a href={to} class={['shadow-xs flex flex-col gap-y-2 rounded-3xl bg-white bg-gradient-to-b p-6']}>
  <div class="flex flex-col gap-y-8">
    <div class="flex justify-center">
      {#if type === 'sen'}
        <enhanced:img src="$lib/assets/jupiter.png?w=200" alt={`${title}`} />
      {:else if type === 'ai'}
        <enhanced:img src="$lib/assets/stars.png?w=200" alt={`${title}`} />
      {:else if type === 'mentalHealth'}
        <enhanced:img src="$lib/assets/saturn.png?w=200" alt={`${title}`} />
      {/if}
    </div>

    <div class="flex flex-col gap-y-2">
      <div class="flex flex-col gap-y-1">
        <Badge variant={colors[type]}>{tag}</Badge>

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
