<script lang="ts">
  import Badge, { type Variant as BadgeVariant } from '$lib/components/Badge.svelte';

  interface Props {
    /**
     * The URL to navigate to when the user clicks on the MLU.
     */
    to: string;
    /**
     * The tags to display on the MLU.
     */
    tags: { variant: BadgeVariant; content: string }[];
    /**
     * The title of the MLU.
     */
    title: string;
  }

  let { to, title, tags }: Props = $props();
</script>

<a href={to} class="flex flex-col gap-y-6 rounded-3xl bg-purple-100 p-6">
  <div class="flex flex-col gap-y-2">
    <div class="flex flex-wrap gap-1">
      {#each tags as tag (tag.content)}
        <Badge variant={tag.variant}>{tag.content}</Badge>
      {/each}
    </div>

    <div class="flex flex-col gap-y-3">
      <span class="truncate text-xl font-medium text-slate-950">
        {title}
      </span>

      <div class="flex gap-x-1">
        <span class="text-sm text-slate-600">Guidance Branch</span>
        <span class="text-sm text-slate-600">•</span>
        <span class="text-sm text-slate-600">2 days ago</span>
      </div>
    </div>
  </div>
</a>
