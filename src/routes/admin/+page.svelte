<script lang="ts">
  import { Plus } from '@lucide/svelte';

  import { LinkButton } from '$lib/components/Button/index.js';
  import { Table, type TableColumn } from '$lib/components/Table/index.js';

  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const columns: TableColumn[] = [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'title',
      label: 'Title',
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
    <div>
      <h1 class="text-2xl font-bold">Learning Units</h1>
      <p class="mt-2 text-sm">Manage all learning units</p>
    </div>

    <LinkButton class="size-10 rounded-xl text-sm" href="/admin/learning-units/new">
      <Plus size={16} /> Create New Learning Unit
    </LinkButton>
  </div>

  <Table {columns} data={data.learningUnits} emptyMessage="No learning units found" />
</div>
