<script lang="ts" generics="T">
  import { Plus, Trash } from '@lucide/svelte';
  import type { Snippet } from 'svelte';

  import { ErrorMessage } from '$lib/components/ErrorMessage';

  interface Props {
    /**
     * The title for the repeatable field section.
     */
    title: string;
    /**
     * The items to render.
     */
    items: T[];
    /**
     * A callback to add a new item.
     */
    onadd: () => void;
    /**
     * A callback to remove an item.
     */
    onremove: (index: number) => void;
    /**
     * The text for the add button.
     */
    addButtonText?: string;
    /**
     *  The empty state message.
     */
    emptyMessage?: string;
    /**
     * The error message to display for the grouped fields.
     */
    error?: string;
    /**
     * The errors for each item.
     */
    itemErrors?: Record<string, string>[];
    /**
     * Snippet to render each item - receives item, index, and item errors
     */
    children: Snippet<[T, number, Record<string, string> | undefined]>;
  }

  const {
    title,
    items,
    onadd,
    onremove,
    addButtonText = 'Add Item',
    emptyMessage = 'No items added yet',
    error,
    itemErrors,
    children,
  }: Props = $props();
</script>

<div class="flex flex-col rounded-md border border-slate-100 bg-slate-50 p-4 shadow-md">
  <div class="flex items-center justify-between p-2">
    {title}
    <button
      type="button"
      onclick={onadd}
      class="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm font-medium shadow-md hover:border-slate-200 hover:bg-slate-100 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
    >
      <span class="inline-flex items-center gap-1"><Plus class="size-4" />{addButtonText}</span>
    </button>
  </div>

  {#if items.length === 0}
    <span class="text-sm text-slate-500">{emptyMessage}</span>
  {:else}
    {#each items as item, index (index)}
      <div class="flex flex-row p-2">
        <div
          class="flex flex-1 flex-col gap-2 rounded-md border border-slate-200 bg-white p-4 shadow-md"
        >
          {@render children(item, index, itemErrors?.[index])}
        </div>

        <button
          type="button"
          aria-label={`Remove item ${index}`}
          onclick={() => onremove(index)}
          class="items-center rounded-md px-2 py-1 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
        >
          <Trash
            class="size-5 text-slate-500 transition-transform delay-100 duration-300 ease-in-out hover:scale-120"
          />
        </button>
      </div>
    {/each}
  {/if}

  <div class="flex justify-center">
    <ErrorMessage message={error} />
  </div>
</div>
