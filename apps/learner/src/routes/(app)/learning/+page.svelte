<script lang="ts">
  import { HandHeart, MessageCircleQuestion, PersonStanding } from '@lucide/svelte';

  import Collection from '$lib/components/Collection.svelte';

  const variantMap = {
    'Special Educational Needs': 'purple',
    'Character and Citizenship Education': 'rose',
    'Inclusive Education': 'amber',
  } as const;

  const collections = [
    {
      title: 'Special Educational Needs',
      icon: HandHeart,
      noOfPodcasts: 12,
      noOfNotes: 2,
    },
    {
      title: 'Character and Citizenship Education',
      icon: PersonStanding,
      noOfPodcasts: 8,
      noOfNotes: 3,
    },
    {
      title: 'Inclusive Education',
      icon: MessageCircleQuestion,
      noOfPodcasts: 10,
      noOfNotes: 1,
    },
  ] as const;
</script>

<div class="grid auto-rows-fr grid-cols-2 gap-4 px-6 pt-5">
  {#each collections as collection, i (i)}
    <div class={i === 0 ? 'col-span-2' : ''}>
      <Collection {...collection} variant={variantMap[collection.title]} />
    </div>
  {/each}
</div>
