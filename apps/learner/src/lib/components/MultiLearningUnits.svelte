<script lang="ts">
  import { Play } from '@lucide/svelte';

  import Badge, { type Variant as BadgeVariant } from '$lib/components/Badge.svelte';

  type Collection =
    | 'Assessment Literacy'
    | 'Differentiated Instruction'
    | 'Inquiry-based Learning'
    | 'e-Pedagogy'
    | 'Character and Citizenship Education'
    | 'Special Educational Needs';

  type Tag = 'Podcast' | 'Note';

  interface Props {
    title: string;
    collection: Collection;
    tags: Tag[];
  }

  let { title, collection, tags }: Props = $props();

  const collectionVariantMapping: Record<Collection, BadgeVariant> = {
    'Assessment Literacy': 'blue',
    'Differentiated Instruction': 'orange',
    'Inquiry-based Learning': 'amber',
    'e-Pedagogy': 'teal',
    'Character and Citizenship Education': 'rose',
    'Special Educational Needs': 'purple',
  };
</script>

<div class="flex flex-col rounded-3xl bg-purple-100 p-6">
  <div class="flex flex-wrap gap-1">
    <Badge variant={collectionVariantMapping[collection]}>{collection}</Badge>

    {#each tags as tag (tag)}
      <Badge variant="slate">{tag}</Badge>
    {/each}
  </div>

  <div class="mt-1">
    <span class="text-xl font-medium text-slate-950">
      {title}
    </span>
  </div>

  <div class="mt-3 flex gap-x-1">
    <span class="text-sm text-slate-600">Guidance Branch</span>
    <span class="text-sm text-slate-600">•</span>
    <span class="text-sm text-slate-600">2 days ago</span>
  </div>

  <div class="mt-5 flex justify-start gap-3">
    <button class="flex items-center justify-center gap-2 rounded-full bg-purple-300 px-6 py-4">
      <Play />
      <span>Play</span>
    </button>

    <div class="flex items-center justify-center gap-2">
      <svg viewBox="0 0 24 24" class="h-6 w-6">
        <circle cx="12" cy="12" r="9" stroke="#D8B4FE" fill="none" stroke-width="3px" />
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="#A855F7"
          fill="none"
          stroke-width="3px"
          stroke-dasharray="56.55"
          stroke-dashoffset="12"
          transform-origin="center"
          transform="rotate(-90 0 0)"
        />
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="#6B21A8"
          fill="none"
          stroke-width="3px"
          stroke-dasharray="56.55"
          stroke-dashoffset="25"
          transform-origin="center"
          transform="rotate(-90 0 0)"
        />
      </svg>

      <span class="text-sm text-slate-600">23m left</span>
    </div>
  </div>
</div>
