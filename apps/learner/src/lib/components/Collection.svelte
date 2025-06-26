<script lang="ts">
  type Variant = 'purple' | 'teal' | 'amber';

  import Badge, { type Variant as BadgeVariant } from '$lib/components/Badge.svelte';

  interface Props {
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
    /**
     * The tag to display on the Collection.
     */
    tag: { variant: BadgeVariant; content: string };
  }

  let { title, numberofpodcasts, numberofnotes, variant, tag }: Props = $props();
</script>

<div
  class={[
    'min-h-50 flex h-full flex-col gap-y-2 rounded-3xl p-4',
    variant === 'purple' && 'bg-purple-500',
    variant === 'amber' && 'bg-amber-400',
    variant === 'teal' && 'bg-teal-400',
  ]}
>
  <div class="flex flex-wrap gap-2">
    <Badge variant={tag.variant} class="truncate rounded-lg" title={tag.content}>
      {tag.content}
    </Badge>
  </div>

  <span class="text-xl font-semibold text-white">{title}</span>

  <div class="flex flex-col">
    <span class="text-sm text-white">{numberofpodcasts} podcasts</span>
    <span class="text-sm text-white">{numberofnotes} notes</span>
  </div>
</div>
