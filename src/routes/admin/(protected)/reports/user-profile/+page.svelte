<script lang="ts">
  import { ArrowLeft, FileSpreadsheet } from '@lucide/svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { LinkButton } from '$lib/components/Button/index.js';
  import Paginator from '$lib/components/Paginator/Paginator.svelte';
  import { Table, type TableColumn } from '$lib/components/Table/index.js';

  import type { PageProps } from './$types';

  let { data }: PageProps = $props();

  const handlePageChange = async (pageNumber: number) => {
    const url = new URL(page.url);
    url.searchParams.set('page', pageNumber.toString());
    await goto(url.toString(), { keepFocus: true });
  };

  const rows = $derived(
    data.records.map((r) => ({
      id: r.userId,
      name: r.user.name,
      email: r.user.email,
      contentPreferences: r.interests.map((i) => i.collection.title).join(', '),
      subscribed: r.isSubscribed ? 'Yes' : 'No',
    })),
  );

  const columns: TableColumn<(typeof rows)[number]>[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'contentPreferences', label: 'Content Preferences', class: 'max-w-xs' },
    { key: 'subscribed', label: 'Subscribed?' },
  ];
</script>

<a
  href="/admin/reports"
  class="flex w-fit items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
>
  <ArrowLeft class="h-4 w-4" />
  Back to reports
</a>

<div class="rounded-lg border border-slate-200 bg-white p-6">
  <div class="flex flex-col gap-1">
    <span class="font-medium">User Profile Report</span>
    <span class="text-sm text-slate-500">
      Onboarded users with their content preferences and subscription status.
    </span>
  </div>
</div>

<div class="flex flex-col gap-0">
  <Table {columns} data={rows} emptyMessage="No onboarded users found" />

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
  <LinkButton href="/admin/api/download/user-profile" variant="secondary" data-sveltekit-reload>
    <FileSpreadsheet class="h-4 w-4" />
    Download XLSX
  </LinkButton>
</div>
