<script lang="ts">
  import { page } from '$app/state';

  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();

  const tabs = [
    { label: 'Quiz Report', href: '/admin/reports/quiz' },
    { label: 'User Profile Report', href: '/admin/reports/user-profile' },
  ];
</script>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  <div>
    <span class="text-xl font-medium">Generate Report</span>
  </div>

  <div class="flex gap-2 border-b border-slate-200">
    {#each tabs as tab (tab.href)}
      <a
        href={tab.href}
        class="border-b-2 px-4 py-2 text-sm font-medium {page.url.pathname === tab.href
          ? 'border-slate-950 text-slate-950'
          : 'border-transparent text-slate-500'}"
      >
        {tab.label}
      </a>
    {/each}
  </div>

  {@render children()}
</div>
