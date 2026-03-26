<script lang="ts">
  import { FileSpreadsheet } from '@lucide/svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { LinkButton } from '$lib/components/Button/index.js';
  import Paginator from '$lib/components/Paginator/Paginator.svelte';
  import { Table, type TableColumn } from '$lib/components/Table/index.js';

  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  let selectedId = $derived(data.quizId);

  const downloadHref = $derived(`/admin/api/download?quizId=${encodeURIComponent(selectedId)}`);

  const handleFilterChange = async () => {
    const url = new URL(page.url);
    if (selectedId) {
      url.searchParams.set('quizId', selectedId);
    } else {
      url.searchParams.delete('quizId');
    }
    url.searchParams.delete('page');
    await goto(url.toString(), { keepFocus: true });
  };

  const handlePageChange = async (pageNumber: number) => {
    const url = new URL(page.url);
    url.searchParams.set('page', pageNumber.toString());
    await goto(url.toString(), { keepFocus: true });
  };

  const rows = $derived(
    data.records.map((r) => ({
      id: r.id,
      name: r.user.name,
      email: r.user.email,
      quizTitle: r.learningUnit.title,
      isCompleted: r.isCompleted ? 'Yes' : 'No',
      numberOfAttempts: r.numberOfAttempts,
    })),
  );

  const columns: TableColumn<(typeof rows)[number]>[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'quizTitle', label: 'Quiz Title' },
    { key: 'isCompleted', label: 'Completed' },
    { key: 'numberOfAttempts', label: 'Attempts' },
  ];
</script>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <div>
    <span class="text-xl font-medium">Generate Report</span>
  </div>

  <div class="rounded-lg border border-slate-200 bg-white p-6">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <span class="font-medium">Quiz Report</span>
        <span class="text-sm text-slate-500">
          Select a quiz to preview results and download the report.
        </span>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="quiz-filter" class="text-sm font-medium text-slate-700">Quiz title</label>
        <select
          id="quiz-filter"
          bind:value={selectedId}
          onchange={handleFilterChange}
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-950 focus:outline-none"
        >
          <option value="" disabled>Select a quiz...</option>
          {#each data.quizzes as quiz (quiz.id)}
            <option value={quiz.id}>{quiz.title}</option>
          {/each}
        </select>
      </div>
    </div>
  </div>

  {#if selectedId}
    <div class="flex flex-col gap-0">
      <Table {columns} data={rows} emptyMessage="No quiz results found" />

      {#if data.totalCount > data.pageSize}
        <Paginator
          totalCount={data.totalCount}
          currentPage={data.currentPage}
          pageSize={data.pageSize}
          onpagechange={handlePageChange}
        />
      {/if}
    </div>

    <div class="flex justify-end">
      <LinkButton href={downloadHref} variant="secondary" data-sveltekit-reload>
        <FileSpreadsheet class="h-4 w-4" />
        Download XLSX
      </LinkButton>
    </div>
  {/if}
</div>
