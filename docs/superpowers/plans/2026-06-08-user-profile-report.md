# User Profile Report Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "User Profile Report" to the admin reports area as its own page route, with a paginated preview and a streamed `.xlsx` download, reusing Spec A's `generateReport` helper. Split the existing quiz report into a sibling page route under a shared layout.

**Architecture:** Two sibling page routes — `admin/(protected)/reports/quiz` and `admin/(protected)/reports/user-profile` — share a `+layout.svelte` that renders the "Generate Report" header and nav (active by pathname); `/admin/reports` redirects to the quiz report. Each page's load runs only its own queries, so server-side pagination works per report with no tab branching or discriminated-union payload. Downloads stay in the API tree as single-purpose endpoints: `admin/api/download/quiz` (unchanged) and a new `admin/api/download/user-profile`. Per [ADR-0003](../../decisions/0003-report-export-routing-and-page-routes.md).

**Tech Stack:** SvelteKit (adapter-node) + Svelte 5 runes, Prisma (pg adapter), ExcelJS streaming (`generateReport`), Vitest, pnpm.

**Source docs:** [Spec B](../specs/2026-06-08-user-profile-report-design.md), [ADR-0003](../../decisions/0003-report-export-routing-and-page-routes.md). Depends on Spec A (already landed on this branch: `src/lib/server/reports/{generateReport,helpers}.ts`, `admin/api/download/quiz/+server.ts`, `admin/(protected)/reports/+page.{server.ts,svelte}`).

**Naming:** route/folder/endpoint segment is `user-profile` (matches the `UserProfile` model); user-facing strings (nav label, sheet name, filename) read "User Profile Report" per #571.

---

## gh workflow (document-only; run nothing until the user explicitly approves)

Per `CLAUDE.md`, the gh steps are established up front. **Do not create a branch, commit, push, or PR until the user asks.**

- [ ] **Read the issue:** `gh issue view 571`
- [ ] **Create the feature branch** (confirm the name with the user first): `git checkout -b feat/user-profile-report`
- [ ] **Open a draft PR** after the first commit, body per `.github/PULL_REQUEST_TEMPLATE.md`:

  ```bash
  gh pr create --draft --title "feat: add user profile report export" --body "$(cat <<'EOF'
  ## 🚀 Summary

  This PR adds a User Profile Report page to the admin reports area, listing each onboarded user with their content preferences and subscription status, downloadable as a streamed .xlsx.

  ## ✏️ Changes

  - Split admin reports into sibling page routes (quiz, user-profile) under a shared layout nav
  - Add the user-profile report page with paginated preview
  - Add `GET /admin/api/download/user-profile` streaming export reusing `generateReport`
  EOF
  )"
  ```

- [ ] **Mark ready** as the final step (see Task 4): `gh pr ready`

Conventional commits **without scope**, **title only** (no body).

---

## File structure

| File                                                                     | Responsibility                                                             | Action      |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ----------- |
| `src/routes/admin/api/download/user-profile/+server.ts`                  | New streaming endpoint: all onboarded users → `.xlsx` via `generateReport` | Create      |
| `src/routes/admin/api/download/user-profile/server.test.ts`              | Endpoint unit tests                                                        | Create      |
| `src/routes/admin/(protected)/reports/+layout.svelte`                    | Shared "Generate Report" header + report nav (active by pathname)          | Create      |
| `src/routes/admin/(protected)/reports/+page.server.ts`                   | Redirect `/admin/reports` → `/admin/reports/quiz`                          | Replace     |
| `src/routes/admin/(protected)/reports/quiz/+page.server.ts`              | Quiz report load (relocated, unchanged)                                    | Move        |
| `src/routes/admin/(protected)/reports/quiz/+page.svelte`                 | Quiz report UI (relocated; header/wrapper removed)                         | Move + edit |
| `src/routes/admin/(protected)/reports/user-profile/+page.server.ts`      | User-profile report load                                                   | Create      |
| `src/routes/admin/(protected)/reports/user-profile/+page.server.test.ts` | Load unit tests                                                            | Create      |
| `src/routes/admin/(protected)/reports/user-profile/+page.svelte`         | User-profile report UI                                                     | Create      |

The quiz download endpoint (`admin/api/download/quiz/+server.ts`) and its test are **unchanged**.

---

## Task 1: User-profile download endpoint

**Files:**

- Create: `src/routes/admin/api/download/user-profile/+server.ts`
- Test: `src/routes/admin/api/download/user-profile/server.test.ts`

Mirrors `admin/api/download/quiz/+server.ts` and its test. No query params, no quiz-title lookup — streams all `UserProfile` rows, keyset-paginated on `userId`.

- [ ] **Step 1: Write the failing endpoint test**

Create `src/routes/admin/api/download/user-profile/server.test.ts`:

```ts
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { GenerateReportOptions } from '$lib/server/reports';

import { GET } from './+server.js';

interface UserProfileReportRow {
  userId: string;
  isSubscribed: boolean;
  user: { name: string; email: string };
  interests: { collection: { title: string } }[];
}

const { mockGenerateReport, mockFindMany } = vi.hoisted(() => ({
  mockGenerateReport:
    vi.fn<(options: GenerateReportOptions<UserProfileReportRow, string>) => Response>(),
  mockFindMany: vi.fn(),
}));

vi.mock('$lib/server/reports', async (importActual) => {
  const actual = await importActual<typeof import('$lib/server/reports')>();
  return { ...actual, generateReport: mockGenerateReport };
});

vi.mock('$lib/server/db.js', () => ({
  db: {
    userProfile: { findMany: mockFindMany },
  },
}));

const silentLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  child: vi.fn(),
};
silentLogger.child.mockReturnValue(silentLogger);

const buildEvent = (url: string, user: { id: string } | null) =>
  ({
    locals: { logger: silentLogger, session: { user } },
    url: new URL(url),
  }) as unknown as Parameters<typeof GET>[0];

beforeEach(() => {
  vi.clearAllMocks();
  silentLogger.child.mockReturnValue(silentLogger);
  mockGenerateReport.mockReturnValue(new Response('ok'));
});

describe('GET /admin/api/download/user-profile', () => {
  test('returns 401 and does not stream when unauthenticated', async () => {
    const event = buildEvent('http://localhost/admin/api/download/user-profile', null);

    const response = await GET(event);

    expect(response.status).toBe(401);
    expect(mockGenerateReport).not.toHaveBeenCalled();
  });

  test('declares the report columns, sheet name, and filename', async () => {
    const event = buildEvent('http://localhost/admin/api/download/user-profile', { id: 'admin-1' });

    await GET(event);

    const options = mockGenerateReport.mock.calls[0][0];
    expect(options.columns.map((c) => c.header)).toEqual([
      'Name',
      'Email',
      'Content Preferences',
      'Subscribed?',
    ]);
    expect(options.sheetName).toBe('User Profile Report');
    expect(options.filename).toMatch(/^\d{14}_user_profile_report\.xlsx$/);
  });

  test('maps a profile to row values with comma-joined preferences', async () => {
    const event = buildEvent('http://localhost/admin/api/download/user-profile', { id: 'admin-1' });
    const record = {
      userId: 'u1',
      isSubscribed: true,
      user: { name: 'Ann', email: 'a@x.co' },
      interests: [{ collection: { title: 'AI' } }, { collection: { title: 'Math' } }],
    };

    await GET(event);

    const options = mockGenerateReport.mock.calls[0][0];
    expect(options.columns.map((c) => c.value(record))).toEqual([
      'Ann',
      'a@x.co',
      'AI, Math',
      'Yes',
    ]);
  });

  test('renders blank preferences and No when a profile has no interests', async () => {
    const event = buildEvent('http://localhost/admin/api/download/user-profile', { id: 'admin-1' });
    const record = {
      userId: 'u2',
      isSubscribed: false,
      user: { name: 'Bob', email: 'b@x.co' },
      interests: [],
    };

    await GET(event);

    const options = mockGenerateReport.mock.calls[0][0];
    expect(options.columns.map((c) => c.value(record))).toEqual(['Bob', 'b@x.co', '', 'No']);
  });

  test('fetchBatch advances the keyset cursor over all profiles', async () => {
    const event = buildEvent('http://localhost/admin/api/download/user-profile', { id: 'admin-1' });
    const fullBatch = Array.from({ length: 100 }, (_, i) => ({ userId: `u-${i}` }));
    mockFindMany.mockResolvedValueOnce(fullBatch).mockResolvedValueOnce([{ userId: 'u-100' }]);

    await GET(event);
    const { fetchBatch } = mockGenerateReport.mock.calls[0][0];
    const first = await fetchBatch(undefined);
    const second = await fetchBatch('u-99');

    expect(mockFindMany.mock.calls[0][0]).toMatchObject({ orderBy: { userId: 'asc' }, take: 100 });
    expect(mockFindMany.mock.calls[0][0]).not.toHaveProperty('cursor');
    expect(first.nextCursor).toBe('u-99');
    expect(mockFindMany.mock.calls[1][0]).toMatchObject({ skip: 1, cursor: { userId: 'u-99' } });
    expect(second.nextCursor).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test run src/routes/admin/api/download/user-profile/server.test.ts`
Expected: FAIL — cannot resolve `./+server.js` (module not created yet).

- [ ] **Step 3: Write the endpoint**

Create `src/routes/admin/api/download/user-profile/+server.ts`:

```ts
import { json } from '@sveltejs/kit';

import { db, type UserProfileFindManyArgs, type UserProfileGetPayload } from '$lib/server/db.js';
import { formatTimestamp, generateReport } from '$lib/server/reports';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_download_user_profile_report' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return json(null, { status: 401 });
  }

  const batchSize = 100;

  const recordArgs = {
    select: {
      userId: true,
      isSubscribed: true,
      user: { select: { name: true, email: true } },
      interests: { select: { collection: { select: { title: true } } } },
    },
    orderBy: { userId: 'asc' },
    take: batchSize,
  } satisfies UserProfileFindManyArgs;

  type UserProfileRow = UserProfileGetPayload<typeof recordArgs>;

  const filename = `${formatTimestamp(new Date())}_user_profile_report.xlsx`;

  return generateReport<UserProfileRow, string>({
    filename,
    sheetName: 'User Profile Report',
    columns: [
      { header: 'Name', value: (row) => row.user.name },
      { header: 'Email', value: (row) => row.user.email },
      {
        header: 'Content Preferences',
        value: (row) => row.interests.map((interest) => interest.collection.title).join(', '),
      },
      { header: 'Subscribed?', value: (row) => (row.isSubscribed ? 'Yes' : 'No') },
    ],
    fetchBatch: async (cursor) => {
      const rows = await db.userProfile.findMany({
        ...recordArgs,
        ...(cursor && { skip: 1, cursor: { userId: cursor } }),
      });
      const nextCursor = rows.length === batchSize ? rows[rows.length - 1].userId : undefined;
      return { rows, nextCursor };
    },
    onError: (err) => logger.error({ err }, 'Failed while streaming user profile report'),
  });
};
```

Notes:

- `recordArgs` keys follow SQL clause order (`select`, `orderBy`, `take`); no `where` (every onboarded user is exported), no base `skip`.
- Keyset cursor is on `userId` (the `UserProfile` primary key), per [ADR-0002](../../decisions/0002-keyset-cursor-pagination-on-primary-key.md).
- `UserProfileFindManyArgs` / `UserProfileGetPayload` are re-exported from `$lib/server/db.js`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test run src/routes/admin/api/download/user-profile/server.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/routes/admin/api/download/user-profile/
git commit -m "feat: add user profile report download endpoint"
```

---

## Task 2: Reports layout, redirect, and quiz page relocation

**Files:**

- Create: `src/routes/admin/(protected)/reports/+layout.svelte`
- Replace: `src/routes/admin/(protected)/reports/+page.server.ts` (now a redirect)
- Move: `reports/+page.server.ts` → `reports/quiz/+page.server.ts` (unchanged), `reports/+page.svelte` → `reports/quiz/+page.svelte` (header/wrapper removed)

The `.svelte` edits are authored/validated with the **svelte-file-editor** (Svelte MCP). Constraints: arrow functions only, no `?.`, do not typecast `page.data`.

- [ ] **Step 1: Relocate the quiz page files**

```bash
mkdir -p "src/routes/admin/(protected)/reports/quiz"
git mv "src/routes/admin/(protected)/reports/+page.server.ts" "src/routes/admin/(protected)/reports/quiz/+page.server.ts"
git mv "src/routes/admin/(protected)/reports/+page.svelte" "src/routes/admin/(protected)/reports/quiz/+page.svelte"
```

The moved `reports/quiz/+page.server.ts` needs **no content change** — its quiz load is correct as-is.

- [ ] **Step 2: Trim the relocated quiz page (header + outer wrapper now live in the layout)**

Edit `src/routes/admin/(protected)/reports/quiz/+page.svelte` — the `<script>` block is unchanged; replace the markup so the outer `mx-auto max-w-6xl` wrapper and the "Generate Report" header (both now owned by the layout) are removed, leaving the report's own blocks as top-level siblings:

```svelte
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
```

- [ ] **Step 3: Create the shared layout**

Create `src/routes/admin/(protected)/reports/+layout.svelte`:

```svelte
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
```

- [ ] **Step 4: Replace the reports root load with a redirect**

Replace the entire contents of `src/routes/admin/(protected)/reports/+page.server.ts`:

```ts
import { redirect } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
  throw redirect(307, '/admin/reports/quiz');
};
```

- [ ] **Step 5: Validate and verify the quiz report still works**

Validate both `.svelte` files with the Svelte MCP autofixer, then:
Run: `pnpm check`
Expected: 0 errors, 0 warnings.

Run: `pnpm test run src/routes/admin/api/download/quiz/server.test.ts`
Expected: PASS — the quiz endpoint test is unaffected by the page move.

Optional manual smoke: `pnpm dev`, open `/admin/reports` → redirects to `/admin/reports/quiz`; the nav shows "Quiz Report" active; the quiz dropdown/preview/download still work.

- [ ] **Step 6: Commit**

```bash
git add "src/routes/admin/(protected)/reports/"
git commit -m "feat: split admin reports into per-report page routes"
```

---

## Task 3: User-profile report page

**Files:**

- Create: `src/routes/admin/(protected)/reports/user-profile/+page.server.ts`
- Test: `src/routes/admin/(protected)/reports/user-profile/+page.server.test.ts`
- Create: `src/routes/admin/(protected)/reports/user-profile/+page.svelte`

- [ ] **Step 1: Write the failing load test**

Create `src/routes/admin/(protected)/reports/user-profile/+page.server.test.ts`:

```ts
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { load } from './+page.server.js';

const { mockProfileFindMany, mockProfileCount } = vi.hoisted(() => ({
  mockProfileFindMany: vi.fn(),
  mockProfileCount: vi.fn(),
}));

vi.mock('$lib/server/db.js', () => ({
  db: {
    userProfile: { findMany: mockProfileFindMany, count: mockProfileCount },
  },
}));

const silentLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  child: vi.fn(),
};
silentLogger.child.mockReturnValue(silentLogger);

const buildEvent = (url: string) =>
  ({
    locals: { logger: silentLogger, session: { user: { id: 'admin-1' } } },
    url: new URL(url),
  }) as unknown as Parameters<typeof load>[0];

beforeEach(() => {
  vi.clearAllMocks();
  silentLogger.child.mockReturnValue(silentLogger);
  mockProfileFindMany.mockResolvedValue([]);
  mockProfileCount.mockResolvedValue(0);
});

describe('user-profile report load', () => {
  test('returns onboarding records ordered by user name', async () => {
    const profiles = [
      { userId: 'u1', isSubscribed: true, user: { name: 'Ann', email: 'a@x.co' }, interests: [] },
    ];
    mockProfileFindMany.mockResolvedValue(profiles);
    mockProfileCount.mockResolvedValue(1);
    const event = buildEvent('http://localhost/admin/reports/user-profile');

    const data = await load(event);

    expect(data.records).toEqual(profiles);
    expect(data.totalCount).toBe(1);
    expect(mockProfileFindMany.mock.calls[0][0]).toMatchObject({
      orderBy: { user: { name: 'asc' } },
      skip: 0,
      take: 10,
    });
  });

  test('paginates records with skip', async () => {
    const event = buildEvent('http://localhost/admin/reports/user-profile?page=3');

    await load(event);

    expect(mockProfileFindMany.mock.calls[0][0]).toMatchObject({ skip: 20, take: 10 });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test run "src/routes/admin/(protected)/reports/user-profile/+page.server.test.ts"`
Expected: FAIL — cannot resolve `./+page.server.js`.

- [ ] **Step 3: Write the load**

Create `src/routes/admin/(protected)/reports/user-profile/+page.server.ts`:

```ts
import { error, redirect } from '@sveltejs/kit';

import { db, type UserProfileFindManyArgs, type UserProfileGetPayload } from '$lib/server/db.js';

import type { PageServerLoad } from './$types';

const PAGE_SIZE = 10;

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_user_profile_report' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    throw redirect(303, '/admin');
  }

  const currentPage = Number(event.url.searchParams.get('page')) || 1;
  const skip = (currentPage - 1) * PAGE_SIZE;

  const recordArgs = {
    select: {
      userId: true,
      isSubscribed: true,
      user: {
        select: { name: true, email: true },
      },
      interests: {
        select: { collection: { select: { title: true } } },
      },
    },
    orderBy: { user: { name: 'asc' } },
    skip,
    take: PAGE_SIZE,
  } satisfies UserProfileFindManyArgs;

  try {
    const [records, totalCount] = await Promise.all([
      db.userProfile.findMany(recordArgs),
      db.userProfile.count(),
    ]);

    return {
      records: records as UserProfileGetPayload<typeof recordArgs>[],
      totalCount,
      currentPage,
      pageSize: PAGE_SIZE,
    };
  } catch (err) {
    logger.error({ err }, 'Failed to fetch user profile report data');
    throw error(500);
  }
};
```

(`recordArgs` keys mirror the sibling quiz load's order — `select`, `orderBy`, `skip`, `take`. No `where`: every onboarded user is listed.)

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test run "src/routes/admin/(protected)/reports/user-profile/+page.server.test.ts"`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the page UI**

Create `src/routes/admin/(protected)/reports/user-profile/+page.svelte` (author/validate with the svelte-file-editor):

```svelte
<script lang="ts">
  import { FileSpreadsheet } from '@lucide/svelte';

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
    { key: 'contentPreferences', label: 'Content Preferences' },
    { key: 'subscribed', label: 'Subscribed?' },
  ];
</script>

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
```

- [ ] **Step 6: Validate and lint**

Run: `pnpm check`
Expected: 0 errors, 0 warnings.

Run: `pnpm exec eslint "src/routes/admin/(protected)/reports/user-profile"`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add "src/routes/admin/(protected)/reports/user-profile/"
git commit -m "feat: add user profile report page"
```

---

## Task 4: Full verification and mark ready

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite once**

Run: `pnpm test run`
Expected: PASS — including the new endpoint test, the new load test, and the existing quiz endpoint test.

- [ ] **Step 2: Type + Svelte check**

Run: `pnpm check`
Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Lint the change set**

Run: `pnpm exec eslint "src/routes/admin/api/download/user-profile" "src/routes/admin/(protected)/reports"`
Expected: clean.

- [ ] **Step 4: Manual smoke (optional, dev DB)**

Start `pnpm dev`: `/admin/reports` redirects to the quiz report; the nav switches between "Quiz Report" and "User Profile Report"; the user-profile page renders its preview table + paginator and "Download XLSX" returns an `.xlsx` with the four columns. (User-profile rows require `UserProfile` data — seed/create a profile if the dev DB has none.)

- [ ] **Step 5: Push and mark the draft PR ready**

```bash
git push -u origin feat/user-profile-report
gh pr ready
```

---

## Self-review (author checklist — completed)

- **Spec coverage:** Shared layout + nav (component 1) → Task 2. Redirect (component 2) → Task 2. Relocated quiz page (component 3) → Task 2. User-profile load (component 4) → Task 3. User-profile UI (component 5) → Task 3. Download endpoint (component 6) → Task 1. Columns Name/Email/Content Preferences/Subscribed → Tasks 1 & 3. Comma-joined topics + Yes/No → Tasks 1 & 3 (with explicit blank-preferences test). 401 defense-in-depth → Task 1. Filename `…_user_profile_report.xlsx`, sheet `User Profile Report` → Task 1. Keyset on `userId`; preview ordered by `user.name` → Tasks 1 & 3. Empty-set `emptyMessage` → Task 3 (`"No onboarded users found"`). Injection / `no-store` / streaming → inherited from `generateReport` (Spec A), unchanged.
- **Placeholder scan:** none — every code/command step is concrete.
- **Type consistency:** `UserProfileRow` = `UserProfileGetPayload<typeof recordArgs>`; the page's `rows`/`columns` use `userId`, `isSubscribed`, `user.{name,email}`, `interests[].collection.title` consistently across endpoint, load, and component. No discriminated union — each page route has its own single-purpose load.
- **Route consistency:** page routes `reports/quiz`, `reports/user-profile`; download endpoints `api/download/quiz` (unchanged), `api/download/user-profile`; nav hrefs and redirect target match these exactly.
