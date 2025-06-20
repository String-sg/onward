<script lang="ts">
  import type { HandHeart, MessageCircleQuestion, PersonStanding } from '@lucide/svelte';
  import type { HTMLAttributes } from 'svelte/elements';

  type Collection =
    | 'Special Educational Needs'
    | 'Character and Citizenship Education'
    | 'Inclusive Education';

  type Icon = typeof HandHeart | typeof MessageCircleQuestion | typeof PersonStanding;

  type Variant = 'purple' | 'rose' | 'amber';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /**
     * The title of the MLU.
     */
    title: Collection;
    /**
     * Icon component representing the collection.
     */
    icon: Icon;
    /**
     * Total number of podcasts in this collection.
     */
    noOfPodcasts: number;
    /**
     * Total number of notes in this collection.
     */
    noOfNotes: number;
    /**
     * Visual colour theme for the card. Provided by the parent via `variantMap`.
     */
    variant: Variant;
  }

  let {
    title,
    icon,
    noOfPodcasts,
    noOfNotes,
    variant,
    class: clazz,
    ...otherProps
  }: Props = $props();

  const IconComponent = icon;
</script>

<div
  {...otherProps}
  class={[
    'min-h-50 flex h-full flex-col rounded-3xl p-4',
    variant === 'purple' && 'bg-purple-500',
    variant === 'rose' && 'bg-rose-500',
    variant === 'amber' && 'bg-amber-500',
    clazz,
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
  <div class="pt-3 text-xl font-semibold text-white">{title}</div>
  <div class="pt-2 text-sm text-white">{noOfPodcasts} podcasts</div>
  <div class="pt-1 text-sm text-white">{noOfNotes} notes</div>
</div>
