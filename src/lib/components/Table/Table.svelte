<script lang="ts">
  import type { Column } from './types';

  export interface Props {
    /** The data to display in the table */
    data: Record<string, unknown>[];
    /** Column configuration */
    columns: Column[];
    /** Optional empty state message */
    emptyMessage?: string;
  }

  let { data, columns, emptyMessage = 'No data found' }: Props = $props();
</script>

<div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-md">
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-slate-200">
      <thead class="bg-slate-100">
        <tr>
          {#each columns as column (column.key)}
            <th class="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
              {column.label}
            </th>
          {/each}
        </tr>
      </thead>

      <tbody class="divide-y divide-slate-200 bg-white text-xs">
        {#each data as item, index (index)}
          <tr class="hover:bg-slate-100">
            {#each columns as column (column.key)}
              <td class="px-6 py-4">
                {item[column.key]}
              </td>
            {/each}
          </tr>
        {:else}
          <tr>
            <td colspan={columns.length} class="px-6 py-12 text-center text-sm">
              {emptyMessage}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
