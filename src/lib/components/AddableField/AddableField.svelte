<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  import { ErrorMessage } from '$lib/components/ErrorMessage';

  interface Props {
    /**
     * The title/heading for the repeatable field section
     */
    title: string;
    /**
     * The array of items to render
     */
    items: T[];
    /**
     * Callback to add a new item
     */
    onadd: () => void;
    /**
     * Callback to remove an item at the given index
     */
    onremove: (index: number) => void;
    /**
     * Text for the add button
     * @default "Add Item"
     */
    addButtonText?: string;
    /**
     * Empty state message when no items exist
     * @default "No items added yet"
     */
    emptyMessage?: string;
    /**
     * Error message to display for the entire field/group
     * When using form validation with structured errors, pass the `message` property.
     * @example error={form?.errors?.sources?.message}
     */
    error?: string;
    /**
     * Per-item error messages as a sparse array
     * Each index corresponds to the item at that index
     * When using form validation with structured errors, pass the `items` property.
     * @example itemErrors={form?.errors?.sources?.items}
     * Structure: [{ fieldName: 'error message' }, undefined, { anotherField: 'error' }]
     */
    itemErrors?: Record<string, string>[];
    /**
     * Additional classes for the container
     */
    class?: string;
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
    class: clazz,
    children,
  }: Props = $props();
</script>

<div class="flex flex-col gap-4 {clazz}">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-semibold">{title}</h2>

    <button
      type="button"
      onclick={onadd}
      class="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-200"
    >
      {addButtonText}
    </button>
  </div>

  {#if items.length === 0}
    <p class="text-sm text-slate-500">{emptyMessage}</p>
  {:else}
    <div class="flex flex-col gap-4">
      {#each items as item, index (index)}
        <div class="flex gap-4 p-4">
          <div class="flex flex-1 flex-col gap-2">
            {@render children(item, index, itemErrors?.[index])}
          </div>

          <button
            type="button"
            onclick={() => onremove(index)}
            class="self-start rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      {/each}
    </div>
  {/if}

  <ErrorMessage message={error} />
</div>
