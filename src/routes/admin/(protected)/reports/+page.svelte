<script lang="ts">
  interface ReportLink {
    title: string;
    description: string;
    href: string;
  }

  const reports: ReportLink[] = [
    {
      title: 'Quiz Report',
      description: 'Quiz completion and attempts per user.',
      href: '/admin/reports/quiz',
    },
    {
      title: 'User Profile Report',
      description: 'Onboarded users with content preferences and subscription status.',
      href: '/admin/reports/user-profile',
    },
  ];
</script>

<div class="flex flex-col gap-1">
  <span class="text-xl font-medium">Generate Report</span>
  <span class="text-sm text-slate-500">Choose a report to preview and download.</span>
</div>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
  {#each reports as report (report.href)}
    <a
      href={report.href}
      class="flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-6 transition-colors hover:border-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950 focus-visible:outline-dashed"
    >
      <span class="font-medium">{report.title}</span>
      <span class="text-sm text-slate-500">{report.description}</span>
    </a>
  {/each}
</div>
