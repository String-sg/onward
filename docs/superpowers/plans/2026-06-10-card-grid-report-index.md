# Card-Grid Report Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the admin reports tab strip with a card-grid landing page at `/admin/reports`, and give each report page a "Back to reports" link.

**Architecture:** `/admin/reports` becomes a static card-grid index built from an inline `ReportLink[]` co-located with the page; the shared layout is slimmed to just the page container; the default-report redirect is deleted; each report page (quiz, user-profile) gains a "← Back to reports" link. No report's data load, query, or download endpoint changes. Realises [ADR-0004](../../decisions/0004-card-grid-report-index.md) per [Spec C](../specs/2026-06-10-card-grid-report-index-design.md).

**Tech Stack:** SvelteKit (adapter-node), Svelte 5 runes, Tailwind, `@lucide/svelte` icons. No new dependencies.

---

## gh workflow

> **Document-only.** Per CLAUDE.md, these commands are documented here but run **only when the user explicitly asks**. Create no branch, commit, push, or PR before then.

- **Issue:** `gh issue view 571` — context for the reports area (the second report that motivated multi-report nav).
- **Branch:** reuse the existing `feat/user-profile-report` branch (decided: Spec C ships in the same branch/PR as the user-profile report). No new branch.
- **Draft PR:** the `feat/user-profile-report` PR covers both the user-profile report (Spec B) and this card-grid restructure (Spec C). If the draft PR does not yet exist, create it with `gh pr create --draft` using a body per `.github/PULL_REQUEST_TEMPLATE.md`.
- **Final step (after all tasks):** `gh pr ready` to mark the PR ready for review.

## File structure

| File                                                             | Change     | Responsibility                                                  |
| ---------------------------------------------------------------- | ---------- | --------------------------------------------------------------- |
| `src/routes/admin/(protected)/reports/+page.svelte`              | **Create** | Card-grid index; inline `ReportLink[]` → one card per report.   |
| `src/routes/admin/(protected)/reports/+page.server.ts`           | **Delete** | Removes the 307 redirect to `/admin/reports/quiz`.              |
| `src/routes/admin/(protected)/reports/+layout.svelte`            | **Modify** | Slim to the shared page container only (drop header + tab nav). |
| `src/routes/admin/(protected)/reports/quiz/+page.svelte`         | **Modify** | Add "← Back to reports" link above content.                     |
| `src/routes/admin/(protected)/reports/user-profile/+page.svelte` | **Modify** | Add "← Back to reports" link above content.                     |

**Testing note:** This is a pure presentation/routing change with no new server logic (the only server edit is deleting a redirect). The repo does not component-test route `+page.svelte`/`+layout.svelte` files — route logic is covered by `+page.server.test.ts`/`server.test.ts`, and this adds none. Verification is `pnpm check` + a `pnpm dev` smoke, per Spec C's Testing section. The existing quiz and user-profile server tests must stay green.

---

### Task 1: Card-grid index, slim layout, delete redirect

Done as one task so every committed state is coherent — the "Generate Report" heading moves from the layout into the new index page, and the redirect is removed so the index actually renders. Doing these separately would leave an intermediate commit with a duplicated heading or a still-redirecting route.

**Files:**

- Create: `src/routes/admin/(protected)/reports/+page.svelte`
- Delete: `src/routes/admin/(protected)/reports/+page.server.ts`
- Modify: `src/routes/admin/(protected)/reports/+layout.svelte`

- [ ] **Step 1: Slim the shared layout**

Replace the entire contents of `src/routes/admin/(protected)/reports/+layout.svelte` with:

```svelte
<script lang="ts">
  import type { LayoutProps } from './$types';

  let { children }: LayoutProps = $props();
</script>

<div class="mx-auto flex max-w-6xl flex-col gap-6">
  {@render children()}
</div>
```

(Removes the `Generate Report` header, the `tabs` array, the `page` import, and the tab-nav block; keeps the `mx-auto … flex flex-col gap-6` container so report pages keep their vertical spacing.)

- [ ] **Step 2: Create the card-grid index page**

Create `src/routes/admin/(protected)/reports/+page.svelte` with:

```svelte
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
```

The page is static — no `+page.server.ts`, no `data` prop. The `ReportLink` shape is the inline presentational list (not a shared registry); adding a report later is one new entry plus its route.

> **Scope note:** Spec C attributes the second card (User Profile Report) to Spec B's index entry. Because this combined PR ships Spec B + Spec C together and the user-profile report already exists on this branch, both entries land here — otherwise the grid would not link to an existing report. The end state intentionally has both cards.

- [ ] **Step 3: Delete the redirect load**

Run: `git rm "src/routes/admin/(protected)/reports/+page.server.ts"`
Expected: the file is removed; `/admin/reports` now resolves to the new index page instead of 307-redirecting.

- [ ] **Step 4: Type-check**

Run: `pnpm check`
Expected: PASS, no errors or warnings (the layout no longer references `page`; the index page references no `$types` data).

- [ ] **Step 5: Smoke test**

Run: `pnpm dev`, then open `/admin/reports` (signed in as an admin).
Expected: the page shows the "Generate Report" heading and a two-card grid (Quiz Report, User Profile Report); no tab strip; no redirect. Clicking a card opens that report's page.

- [ ] **Step 6: Commit**

```bash
git add "src/routes/admin/(protected)/reports/+page.svelte" "src/routes/admin/(protected)/reports/+layout.svelte" "src/routes/admin/(protected)/reports/+page.server.ts"
git commit -m "feat: card-grid report index"
```

---

### Task 2: "Back to reports" link on each report page

**Files:**

- Modify: `src/routes/admin/(protected)/reports/quiz/+page.svelte`
- Modify: `src/routes/admin/(protected)/reports/user-profile/+page.svelte`

- [ ] **Step 1: Add the link to the quiz page**

In `src/routes/admin/(protected)/reports/quiz/+page.svelte`, add `ArrowLeft` to the existing `@lucide/svelte` import:

```svelte
import {(ArrowLeft, FileSpreadsheet)} from '@lucide/svelte';
```

Then insert the back link as the first element in the markup, immediately before the `<div class="rounded-lg border border-slate-200 bg-white p-6">` block:

```svelte
<a
  href="/admin/reports"
  class="flex w-fit items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
>
  <ArrowLeft class="h-4 w-4" />
  Back to reports
</a>
```

- [ ] **Step 2: Add the link to the user-profile page**

In `src/routes/admin/(protected)/reports/user-profile/+page.svelte`, add `ArrowLeft` to the existing `@lucide/svelte` import:

```svelte
import {(ArrowLeft, FileSpreadsheet)} from '@lucide/svelte';
```

Then insert the same back link as the first element in the markup, immediately before the `<div class="rounded-lg border border-slate-200 bg-white p-6">` block:

```svelte
<a
  href="/admin/reports"
  class="flex w-fit items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
>
  <ArrowLeft class="h-4 w-4" />
  Back to reports
</a>
```

The link is intentionally duplicated per page rather than hoisted into shared chrome (per ADR-0004; revisit at the third-plus report).

- [ ] **Step 3: Type-check**

Run: `pnpm check`
Expected: PASS, no errors or warnings.

- [ ] **Step 4: Smoke test**

Run (or keep running): `pnpm dev`, then open `/admin/reports/quiz` and `/admin/reports/user-profile`.
Expected: each page shows a "← Back to reports" link above its content that returns to the card grid.

- [ ] **Step 5: Commit**

```bash
git add "src/routes/admin/(protected)/reports/quiz/+page.svelte" "src/routes/admin/(protected)/reports/user-profile/+page.svelte"
git commit -m "feat: add back-to-reports link on report pages"
```

---

### Final verification

- [ ] **Run the full check + test suite**

Run: `pnpm check && pnpm test run`
Expected: type check passes; existing quiz and user-profile server-load/endpoint tests stay green (this change touches no server logic).

- [ ] **Mark the PR ready (when the user asks)**

Run: `gh pr ready`
Expected: the `feat/user-profile-report` PR moves from draft to ready for review.
