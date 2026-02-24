<script lang="ts">
  import { Plus } from '@lucide/svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { LinkButton } from '$lib/components/Button/index.js';
  import Paginator from '$lib/components/Paginator/Paginator.svelte';
  import { Table, type TableColumn } from '$lib/components/Table/index.js';

  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const handlePageChange = async (pageNumber: number) => {
    const url = new URL(page.url);
    url.searchParams.set('page', pageNumber.toString());
    await goto(url.toString(), { keepFocus: true });
  };

  const onrowclick = async (row: (typeof learningUnits)[number]) => {
    await goto(`/admin/unit/${row.id}/edit`);
  };

  const learningUnits = $derived(
    data.learningUnits.map((unit) => ({
      ...unit,
      createdAt: new Date(unit.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    })),
  );

  const columns: TableColumn<(typeof learningUnits)[number]>[] = [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'title',
      label: 'Title',
    },
    {
      key: 'status',
      label: 'Status',
    },
    {
      key: 'createdBy',
      label: 'Created By',
    },
    {
      key: 'createdAt',
      label: 'Created At',
    },
    {
      key: 'isRecommended',
      label: 'Recommended',
    },
    {
      key: 'isRequired',
      label: 'Required',
    },
  ];
</script>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <div class="flex items-center justify-between">
    <div class="flex flex-col gap-1">
      <span class="text-xl font-medium">Learning Units</span>
      <span class="text-xs text-slate-500">Manage all learning units</span>
    </div>

    <LinkButton href="/admin/unit/new" class="rounded-xl text-sm">
      <Plus size={16} /> Create New Learning Unit
    </LinkButton>
  </div>

  <div class="flex flex-col gap-0">
    <Table {columns} data={learningUnits} emptyMessage="No learning units found" {onrowclick} />

    {#if data.totalCount > data.pageSize}
      <Paginator
        totalCount={data.totalCount}
        currentPage={data.currentPage}
        pageSize={data.pageSize}
        onpagechange={handlePageChange}
      />
    {/if}
  </div>
</div>
