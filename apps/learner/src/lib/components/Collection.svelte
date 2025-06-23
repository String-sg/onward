<script lang="ts">
  import type { Icon } from '@lucide/svelte';

  type Variant = 'purple' | 'rose' | 'amber';

  interface Props {
    /**
     * The title of the Collection.
     */
    title: string;
    /**
     * The icon component representing the Collection.
     */
    icon: typeof Icon;
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

  let { title, icon: IconComponent, numberofpodcasts, numberofnotes, variant }: Props = $props();
</script>

<div
  class={[
    'min-h-50 flex h-full flex-col gap-y-2 rounded-3xl p-4',
    variant === 'purple' && 'bg-purple-500',
    variant === 'rose' && 'bg-rose-500',
    variant === 'amber' && 'bg-amber-500',
  ]}
>
  <div class="flex">
    <div
      class={[
        'rounded-lg p-2',
        variant === 'purple' && 'bg-purple-200 text-purple-900',
        variant === 'rose' && 'bg-rose-200 text-rose-900',
        variant === 'amber' && 'bg-amber-200 text-amber-900',
      ]}
    >
      <IconComponent />
    </div>
  </div>

  <span class="text-xl font-semibold text-white">{title}</span>

  <div class="flex flex-col">
    <span class="text-sm text-white">{numberofpodcasts} podcasts</span>
    <span class="text-sm text-white">{numberofnotes} notes</span>
  </div>
</div>
