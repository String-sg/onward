<script lang="ts">
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import type { FocusEventHandler, KeyboardEventHandler, MouseEventHandler } from 'svelte/elements';

  export interface Props {
    /** Total number of records */
    totalCount: number;
    /** Current page number (1-indexed) */
    currentPage: number;
    /** Number of items per page */
    pageSize: number;
    /** Callback when page changes */
    onpagechange: (page: number) => void | Promise<void>;
  }

  let { totalCount, currentPage, pageSize, onpagechange }: Props = $props();

  const totalPages = $derived(Math.ceil(totalCount / pageSize));
  const lastItem = $derived(Math.min(currentPage * pageSize, totalCount));

  let pageInput = $derived(currentPage.toString());

  $effect(() => {
    pageInput = currentPage.toString();
  });

  const handlePageChange = (event: Event) => {
    const target = event.currentTarget as HTMLInputElement;
    const value = target.value;
    const pageNum = parseInt(value, 10);

    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onpagechange(pageNum);
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    handlePageChange(event);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      handlePageChange(event);
    }
  };

  const handleNextPage: MouseEventHandler<HTMLButtonElement> = () => {
    if (currentPage < totalPages) {
      onpagechange(currentPage + 1);
    }
  };

  const handlePreviousPage: MouseEventHandler<HTMLButtonElement> = () => {
    if (currentPage > 1) {
      onpagechange(currentPage - 1);
    }
  };
</script>

<div class="flex items-center justify-between px-6 py-3">
  <span class="text-sm">Showing {lastItem} of {totalCount}</span>

  <div class="flex items-center gap-4">
    <!-- Previous button -->
    <button
      class="text-slate-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed disabled:opacity-50"
      disabled={currentPage === 1}
      onclick={handlePreviousPage}
    >
      <ChevronLeft class="size-6" />
    </button>

    <!-- Page input -->
    <div class="flex items-center gap-2">
      <input
        type="text"
        class="w-14 rounded-md border border-slate-200 px-3 py-2 text-center text-sm shadow-md focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
        value={pageInput}
        oninput={(e) => (pageInput = e.currentTarget.value)}
        onblur={handleBlur}
        onkeydown={handleKeyDown}
        aria-label="Current page"
      />
      <span class="text-sm">of {totalPages}</span>
    </div>

    <!-- Next button -->
    <button
      class="text-slate-500 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed disabled:opacity-50"
      disabled={currentPage === totalPages}
      onclick={handleNextPage}
    >
      <ChevronRight class="size-6" />
    </button>
  </div>
</div>
