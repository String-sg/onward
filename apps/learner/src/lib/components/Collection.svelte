<script lang="ts">
  export type Variant = 'purple' | 'teal' | 'amber';

  import Badge from '$lib/components/Badge.svelte';

  interface Props {
    /**
     * The URL to navigate to when the user clicks on the MLU.
     */
    to: string;
    /**
     * The tag to display on the Collection.
     */
    tag: string;
    /**
     * The title of the Collection.
     */
    title: string;
    /**
     * Total number of podcasts in this Collection.
     */
    numberofpodcasts: number;
    /**
     * Total number of notes in this Collection.
     */
    numberofnotes: number;
    /**
     * Visual colour theme for the Collection.
     */
    variant: Variant;
  }

  let { to, tag, title, numberofpodcasts, numberofnotes, variant }: Props = $props();
</script>

<a
  href={to}
  class={[
    'min-h-50 flex h-full flex-col gap-y-2 rounded-3xl p-4',
    variant === 'purple' && 'bg-purple-500',
    variant === 'amber' && 'bg-amber-400',
    variant === 'teal' && 'bg-teal-400',
  ]}
>
  <div class="flex flex-wrap gap-2">
    <Badge {variant} class="truncate rounded-lg">{tag}</Badge>
  </div>

  <span class="text-xl font-semibold text-white">{title}</span>

  <div class="flex flex-col">
    <span class="text-sm text-white">{numberofpodcasts} podcasts</span>
    <span class="text-sm text-white">{numberofnotes} notes</span>
  </div>
</a>
