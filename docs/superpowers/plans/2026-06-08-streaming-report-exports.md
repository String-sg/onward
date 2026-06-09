# Streaming Report Exports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the buffered admin quiz `.xlsx` export with a memory-bounded, end-to-end streaming export built on a reusable `generateReport` helper.

**Architecture:** A generic `generateReport(options)` helper pipes an `ExcelJS.stream.xlsx.WorkbookWriter` through a Node `PassThrough`, returns its readable side as the SvelteKit `Response` body, and drives an un-awaited write loop that pulls keyset-cursor-batched pages from a caller-supplied `fetchBatch` closure. The helper has no `RequestEvent` or logging dependency — on a mid-stream failure it always destroys the stream and invokes an optional `onError` callback if the caller supplied one. The quiz endpoint moves to `admin/api/download/quiz` and is rewritten to declare only its columns, `fetchBatch`, and an `onError` that logs; the vendored `xlsx` dependency is removed.

**Tech Stack:** SvelteKit (adapter-node, Node 24), Svelte 5, Prisma (pg adapter), `exceljs`, Vitest. Package manager: `pnpm`.

**Scope:** This is **PR1 of 2** (Spec A — [streaming foundation + quiz migration](../specs/2026-06-08-streaming-report-exports-design.md)). The onboarding report (Spec B) is a separate plan, stacked on this branch, written after PR1 lands. Decisions: [ADR-0001](../../decisions/0001-stream-report-exports-with-exceljs.md) (streaming via generic helper), [ADR-0002](../../decisions/0002-keyset-cursor-pagination-on-primary-key.md) (keyset cursor on primary key).

**Conventions (from CLAUDE.md + project memory):**

- Conventional commit titles, **no scope, title only, no body, no Co-Authored-By**.
- `chore:` for dependency add/remove; `feat:`/`refactor:` for code.
- Tests: AAA with clear Arrange/Act/Assert separation, **inline setup, no extracted test helpers**.
- `interface` for object shapes (lint: `consistent-type-definitions: interface`); `type` only for unions/function/mapped types. Inline type imports.
- Import Prisma types from `$lib/server/db`, never the generated path.
- Prisma query args follow **SQL clause order** — `select`, `where`, `orderBy`, `take`, `skip`, `cursor`. Type the args object with the generated `*FindManyArgs`/`*FindUniqueArgs` via `satisfies`, and derive row types with `*GetPayload<typeof args>` — never `as const`.
- `gh` CLI for all GitHub operations. Branch + **draft** PR are documented up front (below) and `gh pr ready` at the end; **document-only — run none of them until explicitly approved.**
- Run `pnpm` (not `npx`). `pnpm test run <file>` for a single-file run; `pnpm check` for type/svelte check.

---

## File Structure

| Path                                                 | Action         | Responsibility                                                                        |
| ---------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------- |
| `src/lib/server/reports/helpers.ts`                  | create         | Shared pure `sanitizeSpreadsheetCell` and `formatTimestamp` utilities.                |
| `src/lib/server/reports/helpers.test.ts`             | create         | Unit tests for the sanitizer and the timestamp formatter.                             |
| `src/lib/server/reports/generateReport.ts`           | create         | `generateReport` helper; owns all streaming, headers, sanitization, abort-on-error.   |
| `src/lib/server/reports/generateReport.test.ts`      | create         | Unit tests for the helper.                                                            |
| `src/lib/server/reports/index.ts`                    | create         | Barrel re-exporting `generateReport` and the helpers.                                 |
| `src/routes/admin/api/download/quiz/+server.ts`      | create (moved) | Quiz export endpoint; declares columns + `fetchBatch`, delegates to `generateReport`. |
| `src/routes/admin/api/download/quiz/+server.test.ts` | create         | Endpoint tests (auth, columns, row mapping, cursor, filter).                          |
| `src/routes/admin/api/download/+server.ts`           | delete         | Old buffered endpoint (sole `xlsx` consumer).                                         |
| `src/routes/admin/(protected)/reports/+page.svelte`  | modify         | Point the download link at the nested `/quiz` route.                                  |
| `package.json` / `pnpm-lock.yaml`                    | modify         | Add `exceljs`; remove `xlsx`.                                                         |
| `vendor/xlsx-0.20.3.tgz`                             | delete         | Vendored tarball, no longer referenced.                                               |

---

## Task 0: Branch and draft PR (gh — run on approval)

> **Documented per the gh-first workflow; the agent runs none of these until you explicitly approve** (the no-commit/PR rule stands). Spec A has no tracking issue, so there is no `gh issue view` step — issue-backed plans start with `gh issue view <#>`.

- [ ] **Step 1: Create the feature branch**

```bash
git switch -c feat/streaming-report-exports
```

- [ ] **Step 2: Open a draft PR** (once Task 1's first commit exists on the branch; fill the body from `.github/PULL_REQUEST_TEMPLATE.md`)

```bash
gh pr create --draft --title "feat: stream report exports"
```

Commits from the tasks below push to this branch/PR. The final task marks it ready.

---

## Task 1: Add the `exceljs` dependency

**Files:**

- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Install exceljs**

Run: `pnpm add exceljs`
Expected: `package.json` gains `"exceljs"` under `dependencies`; `pnpm-lock.yaml` updated. (`exceljs` ships its own types — no `@types/exceljs` needed.)

- [ ] **Step 2: Verify it resolves**

Run: `pnpm check`
Expected: PASS (no new errors).

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add exceljs dependency"
```

---

## Task 2: Shared pure utilities (`sanitizeSpreadsheetCell`, `formatTimestamp`)

Two pure helpers co-located in `reports/helpers.ts`, both shared by the quiz export and the onboarding report (Spec B): `sanitizeSpreadsheetCell` neutralizes CSV/formula injection by prefixing a leading formula-trigger character with `'`; `formatTimestamp` formats a `Date` as a `DDMMYYYYHHmmss` filename prefix.

**Files:**

- Create: `src/lib/server/reports/helpers.ts`
- Test: `src/lib/server/reports/helpers.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/server/reports/helpers.test.ts`:

```ts
import { describe, expect, test } from 'vitest';

import { formatTimestamp, sanitizeSpreadsheetCell } from './helpers.js';

describe('sanitizeSpreadsheetCell', () => {
  test('prefixes a leading equals sign with a quote', () => {
    const value = '=SUM(A1:A2)';

    const result = sanitizeSpreadsheetCell(value);

    expect(result).toBe("'=SUM(A1:A2)");
  });

  test('prefixes leading +, -, @, tab, and carriage return', () => {
    const values = ['+1', '-1', '@cmd', '\tx', '\rx'];

    const results = values.map(sanitizeSpreadsheetCell);

    expect(results).toEqual(["'+1", "'-1", "'@cmd", "'\tx", "'\rx"]);
  });

  test('leaves safe values unchanged', () => {
    const values = ['Ann', 'a@x.co'.slice(1), 'a=b', ''];

    const results = values.map(sanitizeSpreadsheetCell);

    expect(results).toEqual(['Ann', '@x.co', 'a=b', '']);
  });
});

describe('formatTimestamp', () => {
  test('formats a date as DDMMYYYYHHmmss', () => {
    const date = new Date(2026, 5, 8, 14, 30, 45);

    const result = formatTimestamp(date);

    expect(result).toBe('08062026143045');
  });

  test('zero-pads single-digit day, month, hour, minute, and second', () => {
    const date = new Date(2026, 0, 3, 4, 5, 6);

    const result = formatTimestamp(date);

    expect(result).toBe('03012026040506');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test run src/lib/server/reports/helpers.test.ts`
Expected: FAIL — cannot resolve `./helpers.js` / `sanitizeSpreadsheetCell` and `formatTimestamp` are not exported.

- [ ] **Step 3: Write the minimal implementation**

Create `src/lib/server/reports/helpers.ts`:

```ts
export const sanitizeSpreadsheetCell = (value: string): string => {
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  return value;
};

export const formatTimestamp = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${dd}${mm}${yyyy}${hh}${min}${ss}`;
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test run src/lib/server/reports/helpers.test.ts`
Expected: PASS (5 tests — 3 sanitizer + 2 timestamp).

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/reports/helpers.ts src/lib/server/reports/helpers.test.ts
git commit -m "feat: add spreadsheet cell sanitizer and timestamp formatter"
```

---

## Task 3: `generateReport` helper

Turns a column definition + a cursor-driven batch fetcher into a streamed `.xlsx` HTTP response. Bounded memory; sets headers incl. `Cache-Control: no-store`; sanitizes every string cell; un-awaited write loop always destroys the stream on error and calls the caller-supplied `onError` if one was given. The helper takes no `RequestEvent` and has no logging dependency — error observation is inverted to the caller via an optional `onError` callback.

**Files:**

- Create: `src/lib/server/reports/generateReport.ts`, `src/lib/server/reports/index.ts`
- Test: `src/lib/server/reports/generateReport.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/server/reports/generateReport.test.ts`:

```ts
import { describe, expect, test, vi } from 'vitest';

import { generateReport } from './generateReport.js';

describe('generateReport', () => {
  test('drives fetchBatch until nextCursor is undefined and streams an xlsx body', async () => {
    const onError = vi.fn();
    const fetchBatch = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ a: 'x' }], nextCursor: 'c1' })
      .mockResolvedValueOnce({ rows: [{ a: 'y' }], nextCursor: undefined });

    const response = generateReport({
      filename: 'report.xlsx',
      sheetName: 'Sheet',
      columns: [{ header: 'A', value: (row: { a: string }) => row.a }],
      fetchBatch,
      onError,
    });

    const reader = response.body!.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
    }
    const bytes = chunks.reduce((acc, c) => acc + c.byteLength, 0);

    expect(fetchBatch).toHaveBeenCalledTimes(2);
    expect(fetchBatch).toHaveBeenNthCalledWith(1, undefined);
    expect(fetchBatch).toHaveBeenNthCalledWith(2, 'c1');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(onError).not.toHaveBeenCalled();
    expect(bytes).toBeGreaterThan(0);
    expect(chunks[0][0]).toBe(0x50); // 'P' — xlsx is a zip
    expect(chunks[0][1]).toBe(0x4b); // 'K'
  });

  test('calls onError and aborts the stream when fetchBatch rejects', async () => {
    const onError = vi.fn();
    const fetchBatch = vi.fn().mockRejectedValue(new Error('boom'));

    const response = generateReport({
      filename: 'report.xlsx',
      sheetName: 'Sheet',
      columns: [{ header: 'A', value: (row: { a: string }) => row.a }],
      fetchBatch,
      onError,
    });

    const drain = async () => {
      const reader = response.body!.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) {
          break;
        }
      }
    };

    await expect(drain()).rejects.toThrow();
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  test('aborts the stream without throwing when fetchBatch rejects and no onError is given', async () => {
    const fetchBatch = vi.fn().mockRejectedValue(new Error('boom'));

    const response = generateReport({
      filename: 'report.xlsx',
      sheetName: 'Sheet',
      columns: [{ header: 'A', value: (row: { a: string }) => row.a }],
      fetchBatch,
    });

    const drain = async () => {
      const reader = response.body!.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) {
          break;
        }
      }
    };

    await expect(drain()).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test run src/lib/server/reports/generateReport.test.ts`
Expected: FAIL — cannot resolve `./generateReport.js` / `generateReport` is not exported.

- [ ] **Step 3: Write the implementation**

Create `src/lib/server/reports/generateReport.ts` (imports `sanitizeSpreadsheetCell` from the sibling `helpers.ts`):

```ts
import { PassThrough, Readable } from 'node:stream';

import ExcelJS from 'exceljs';

import { sanitizeSpreadsheetCell } from './helpers.js';

const SPREADSHEET_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export interface Column<Row> {
  header: string;
  value: (row: Row) => string | number | boolean;
}

export interface GenerateReportOptions<Row, Cursor> {
  filename: string;
  sheetName: string;
  columns: Column<Row>[];
  fetchBatch: (
    cursor: Cursor | undefined,
  ) => Promise<{ rows: Row[]; nextCursor: Cursor | undefined }>;
  onError?: (err: unknown) => void;
}

export const generateReport = <Row, Cursor>(
  options: GenerateReportOptions<Row, Cursor>,
): Response => {
  const { filename, sheetName, columns, fetchBatch, onError } = options;

  const passThrough = new PassThrough();
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: passThrough });
  const sheet = workbook.addWorksheet(sheetName);

  const write = async (): Promise<void> => {
    try {
      sheet.addRow(columns.map((column) => column.header)).commit();

      let cursor: Cursor | undefined = undefined;
      do {
        const { rows, nextCursor } = await fetchBatch(cursor);
        for (const row of rows) {
          const cells = columns.map((column) => {
            const cell = column.value(row);
            return typeof cell === 'string' ? sanitizeSpreadsheetCell(cell) : cell;
          });
          sheet.addRow(cells).commit();
        }
        cursor = nextCursor;
      } while (cursor !== undefined);

      sheet.commit();
      await workbook.commit();
    } catch (err) {
      if (onError) {
        onError(err);
      }
      passThrough.destroy(err instanceof Error ? err : new Error('generate report failed'));
    }
  };

  // Detached on purpose: the Response must return while the workbook is still
  // being written, so the stream can flow to the client. The loop owns its own
  // error handling above; `void` marks the intentional fire-and-forget.
  void write();

  return new Response(Readable.toWeb(passThrough) as ReadableStream<Uint8Array>, {
    headers: {
      'Content-Type': SPREADSHEET_CONTENT_TYPE,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
};
```

> Note: the `do/while` calls `fetchBatch(cursor)` starting at `undefined` and stops as soon as a batch returns `nextCursor: undefined`. The header row is written before the loop so an empty result set still yields a valid header-only workbook.

Then create the barrel `src/lib/server/reports/index.ts` so consumers import the folder:

```ts
export * from './helpers.js';
export * from './generateReport.js';
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test run src/lib/server/reports/generateReport.test.ts`
Expected: PASS (3 helper tests).

- [ ] **Step 5: Type-check**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/server/reports/generateReport.ts src/lib/server/reports/generateReport.test.ts src/lib/server/reports/index.ts
git commit -m "feat: add generateReport streaming xlsx helper"
```

---

## Task 4: Move and rewrite the quiz endpoint

Move `admin/api/download` → `admin/api/download/quiz` and rewrite it to use `generateReport`. Business logic preserved: same `where` (`questionAnswers: { some: {} }`, optional `quizId`), same columns, same filename format. Behavioral deltas are internal (streaming), row order (`user.name` → primary key), and the `Cache-Control: no-store` header.

**Files:**

- Create: `src/routes/admin/api/download/quiz/+server.ts`
- Test: `src/routes/admin/api/download/quiz/+server.test.ts`
- Delete: `src/routes/admin/api/download/+server.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/routes/admin/api/download/quiz/+server.test.ts`:

```ts
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { GET } from './+server.js';

const { mockGenerateReport, mockFindMany, mockFindUnique } = vi.hoisted(() => ({
  mockGenerateReport: vi.fn(() => new Response('ok')),
  mockFindMany: vi.fn(),
  mockFindUnique: vi.fn(),
}));

vi.mock('$lib/server/reports', async (importActual) => {
  const actual = await importActual<typeof import('$lib/server/reports')>();
  return { ...actual, generateReport: mockGenerateReport };
});

vi.mock('$lib/server/db.js', () => ({
  db: {
    learningJourney: { findMany: mockFindMany },
    learningUnit: { findUnique: mockFindUnique },
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

describe('GET /admin/api/download/quiz', () => {
  test('returns 401 and does not stream when unauthenticated', async () => {
    const event = buildEvent('http://localhost/admin/api/download/quiz', null);

    const response = await GET(event);

    expect(response.status).toBe(401);
    expect(mockGenerateReport).not.toHaveBeenCalled();
  });

  test('declares the report columns, sheet name, and filename', async () => {
    mockFindUnique.mockResolvedValue({ title: 'My Quiz' });
    const event = buildEvent('http://localhost/admin/api/download/quiz?quizId=quiz-1', {
      id: 'admin-1',
    });

    await GET(event);

    const options = mockGenerateReport.mock.calls[0][0];
    expect(options.columns.map((c) => c.header)).toEqual([
      'Name',
      'Email',
      'Quiz Title',
      'Is Completed',
      'Number of Attempts',
    ]);
    expect(options.sheetName).toBe('Quiz Report');
    expect(options.filename).toMatch(/^\d{14}_My_Quiz_user_report\.xlsx$/);
  });

  test('maps a record to row values', async () => {
    mockFindUnique.mockResolvedValue({ title: 'My Quiz' });
    const event = buildEvent('http://localhost/admin/api/download/quiz?quizId=quiz-1', {
      id: 'admin-1',
    });
    const record = {
      id: '1',
      isCompleted: true,
      numberOfAttempts: 3,
      user: { name: 'Ann', email: 'a@x.co' },
      learningUnit: { title: 'Quiz X' },
    };

    await GET(event);

    const options = mockGenerateReport.mock.calls[0][0];
    expect(options.columns.map((c) => c.value(record))).toEqual([
      'Ann',
      'a@x.co',
      'Quiz X',
      'Yes',
      3,
    ]);
  });

  test('fetchBatch advances the keyset cursor and honors the quizId filter', async () => {
    mockFindUnique.mockResolvedValue({ title: 'My Quiz' });
    const event = buildEvent('http://localhost/admin/api/download/quiz?quizId=quiz-1', {
      id: 'admin-1',
    });
    const fullBatch = Array.from({ length: 100 }, (_, i) => ({ id: `id-${i}` }));
    mockFindMany.mockResolvedValueOnce(fullBatch).mockResolvedValueOnce([{ id: 'id-100' }]);

    await GET(event);
    const { fetchBatch } = mockGenerateReport.mock.calls[0][0];
    const first = await fetchBatch(undefined);
    const second = await fetchBatch('id-99');

    expect(mockFindMany.mock.calls[0][0]).toMatchObject({
      where: { learningUnit: { questionAnswers: { some: {} }, id: 'quiz-1' } },
      orderBy: { id: 'asc' },
      take: 100,
    });
    expect(mockFindMany.mock.calls[0][0]).not.toHaveProperty('cursor');
    expect(first.nextCursor).toBe('id-99');
    expect(mockFindMany.mock.calls[1][0]).toMatchObject({ skip: 1, cursor: { id: 'id-99' } });
    expect(second.nextCursor).toBeUndefined();
  });

  test('returns 404 and does not stream when a given quizId resolves to no quiz', async () => {
    mockFindUnique.mockResolvedValue(null);
    const event = buildEvent('http://localhost/admin/api/download/quiz?quizId=missing', {
      id: 'admin-1',
    });

    const response = await GET(event);

    expect(response.status).toBe(404);
    expect(mockGenerateReport).not.toHaveBeenCalled();
  });

  test('omits the id filter and the title lookup when no quizId is given', async () => {
    const event = buildEvent('http://localhost/admin/api/download/quiz', { id: 'admin-1' });
    mockFindMany.mockResolvedValue([]);

    await GET(event);
    const { fetchBatch } = mockGenerateReport.mock.calls[0][0];
    await fetchBatch(undefined);

    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockFindMany.mock.calls[0][0].where).toEqual({
      learningUnit: { questionAnswers: { some: {} } },
    });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test run src/routes/admin/api/download/quiz/+server.test.ts`
Expected: FAIL — cannot resolve `./+server.js`.

- [ ] **Step 3: Create the new endpoint**

Create `src/routes/admin/api/download/quiz/+server.ts`:

```ts
import { json } from '@sveltejs/kit';

import {
  db,
  type LearningJourneyFindManyArgs,
  type LearningJourneyGetPayload,
  type LearningUnitFindUniqueArgs,
  type LearningUnitGetPayload,
} from '$lib/server/db.js';
import { formatTimestamp, generateReport } from '$lib/server/reports';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_download_quiz_report' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return json(null, { status: 401 });
  }

  const quizId = event.url.searchParams.get('quizId')?.trim() || undefined;

  const batchSize = 100;

  const recordArgs = {
    select: {
      id: true,
      isCompleted: true,
      numberOfAttempts: true,
      user: { select: { name: true, email: true } },
      learningUnit: { select: { title: true } },
    },
    where: {
      learningUnit: {
        questionAnswers: { some: {} },
        ...(quizId && { id: quizId }),
      },
    },
    orderBy: { id: 'asc' },
    take: batchSize,
  } satisfies LearningJourneyFindManyArgs;

  type QuizRow = LearningJourneyGetPayload<typeof recordArgs>;

  let quiz: LearningUnitGetPayload<{ select: { title: true } }> | null = null;
  if (quizId) {
    const quizArgs = {
      select: { title: true },
      where: { id: quizId },
    } satisfies LearningUnitFindUniqueArgs;

    try {
      quiz = await db.learningUnit.findUnique(quizArgs);
    } catch (err) {
      logger.error({ err }, 'Failed to look up quiz title');
      return json(null, { status: 500 });
    }

    if (!quiz) {
      logger.warn({ quizId }, 'Quiz not found');
      return json(null, { status: 404 });
    }
  }

  const quizTitle = (quiz?.title ?? 'quiz').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${formatTimestamp(new Date())}_${quizTitle}_user_report.xlsx`;

  return generateReport<QuizRow, string>({
    filename,
    sheetName: 'Quiz Report',
    columns: [
      { header: 'Name', value: (row) => row.user.name },
      { header: 'Email', value: (row) => row.user.email },
      { header: 'Quiz Title', value: (row) => row.learningUnit.title },
      { header: 'Is Completed', value: (row) => (row.isCompleted ? 'Yes' : 'No') },
      { header: 'Number of Attempts', value: (row) => row.numberOfAttempts },
    ],
    fetchBatch: async (cursor) => {
      const rows = await db.learningJourney.findMany({
        ...recordArgs,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
      });
      const nextCursor = rows.length === batchSize ? rows[rows.length - 1].id : undefined;
      return { rows, nextCursor };
    },
    onError: (err) => logger.error({ err }, 'Failed while streaming quiz report'),
  });
};
```

- [ ] **Step 4: Delete the old endpoint**

Run: `git rm src/routes/admin/api/download/+server.ts`
Expected: the old buffered endpoint (sole `xlsx` consumer) is removed.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm test run src/routes/admin/api/download/quiz/+server.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 6: Type-check**

Run: `pnpm check`
Expected: PASS. (If `./$types` is unresolved, run `pnpm exec svelte-kit sync` first — `pnpm check` runs sync itself.)

- [ ] **Step 7: Commit**

```bash
git add src/routes/admin/api/download/quiz/+server.ts src/routes/admin/api/download/quiz/+server.test.ts src/routes/admin/api/download/+server.ts
git commit -m "feat: stream quiz report export via generateReport"
```

---

## Task 5: Point the reports download link at the nested route

This is an href change only. **Keep the existing native anchor (`LinkButton` + `data-sveltekit-reload`); do not convert the download to a `fetch`.** The anchor lets the browser stream the response straight to disk with near-zero client memory — the whole point of the feature. The cost is that a non-200 (401/404/500) is a full navigation showing the raw body rather than an in-page error; that is an accepted trade-off (the quiz dropdown only offers valid ids, so the 404 path is near-unreachable from the UI). See the spec's Error handling.

**Files:**

- Modify: `src/routes/admin/(protected)/reports/+page.svelte:16`

- [ ] **Step 1: Update the download href**

In `src/routes/admin/(protected)/reports/+page.svelte`, change the `downloadHref`:

```svelte
const downloadHref = $derived( `/admin/api/download/quiz?quizId=${encodeURIComponent(selectedId)}`,
);
```

(Was `/admin/api/download?quizId=...`.)

- [ ] **Step 2: Type-check**

Run: `pnpm check`
Expected: PASS.

- [ ] **Step 3: Manual verification**

Run: `pnpm dev`, sign in to `/admin`, open **Generate Report**, select a quiz, click **Download XLSX**.
Expected: a `.xlsx` downloads from `/admin/api/download/quiz`, opens in a spreadsheet app with the five columns and one row per result. (No page-level test harness exists for this route component; this is verified manually.)

- [ ] **Step 4: Commit**

```bash
git add "src/routes/admin/(protected)/reports/+page.svelte"
git commit -m "fix: point quiz report download link to nested route"
```

---

## Task 6: Remove the vendored `xlsx` dependency

Safe only now that no code imports `xlsx` (Task 4 deleted the last consumer).

**Files:**

- Modify: `package.json`, `pnpm-lock.yaml`
- Delete: `vendor/xlsx-0.20.3.tgz`

- [ ] **Step 1: Confirm nothing imports xlsx**

Run: `grep -rn "xlsx" src/`
Expected: no matches.

- [ ] **Step 2: Remove the dependency**

Run: `pnpm remove xlsx`
Expected: the `"xlsx": "file:vendor/xlsx-0.20.3.tgz"` entry is gone from `package.json`; `pnpm-lock.yaml` updated.

- [ ] **Step 3: Delete the vendored tarball**

Run: `git rm vendor/xlsx-0.20.3.tgz`
Expected: tarball removed.

- [ ] **Step 4: Verify the build still type-checks and tests pass**

Run: `pnpm check && pnpm test run src/lib/server/reports/helpers.test.ts src/lib/server/reports/generateReport.test.ts src/routes/admin/api/download/quiz/+server.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml vendor/xlsx-0.20.3.tgz
git commit -m "chore: remove vendored xlsx dependency"
```

---

## Task 7: Mark the PR ready (gh — run on approval)

Once Tasks 1-6 pass and the branch is pushed, take the draft PR out of draft.

- [ ] **Step 1: Mark ready for review**

```bash
gh pr ready
```

---

## Self-Review

**Spec coverage (Spec A):**

- Goal "bounded memory, true streaming of read + write" → Task 3 (`generateReport` un-awaited loop + `PassThrough` + `Readable.toWeb`); Task 4 (`fetchBatch` keyset batching). ✅
- Goal "reusable export helper" → Task 3 generic `generateReport<Row, Cursor>`; Spec B consumes it. ✅
- Component 1 "add exceljs, remove vendored xlsx" → Task 1, Task 6. ✅
- Component 2 "`src/lib/server/reports/` folder — `helpers.ts` (shared `sanitizeSpreadsheetCell` + `formatTimestamp`), `generateReport.ts` (helper), `index.ts` (barrel)" → Task 2 (both utilities), Task 3 (helper + barrel). ✅
- Component 3 "quiz endpoint moved + rewritten; download link updated" → Task 4, Task 5. ✅
- Error handling "401 before stream; 404 on missing quiz before stream; mid-stream error calls `onError` + destroys stream" → Task 4 (401, 404 when a supplied `quizId` resolves to null, `onError` logs via handler logger), Task 3 (`write()` `try/catch` calls `onError` + `passThrough.destroy`; the call is `void`-detached so the `Response` returns while streaming). ✅
- Security "sanitize all string cells; `Cache-Control: no-store`; per-handler 401 defense-in-depth" → Task 2/3 (sanitize), Task 3 (header), Task 4 (401). ✅
- Testing "sanitizer cases; timestamp formatting; helper drives to exhaustion + aborts; endpoint auth/404/columns/cursor/filter; empty set → header-only" → Task 2 (sanitizer + `formatTimestamp`), Task 3, Task 4 tests (incl. 404 when a given `quizId` resolves to no quiz); header-only behavior is the header-row-before-loop note in Task 3. ✅

**Placeholder scan:** No TBD/TODO; every code/test step shows full content. ✅

**Type consistency:** `generateReport<Row, Cursor>(options): Response`, `GenerateReportOptions.fetchBatch: (cursor) => Promise<{ rows; nextCursor }>`, `GenerateReportOptions.onError?: (err) => void` (optional), `Column.value: (row) => string | number | boolean`, `sanitizeSpreadsheetCell(value: string): string`, `formatTimestamp(date: Date): string` — used identically in the helper, its tests, and the quiz endpoint (`generateReport<QuizRow, string>`, `fetchBatch` returns `{ rows, nextCursor }`, columns return string/number, `formatTimestamp(new Date())` builds the filename prefix). `Column` and `GenerateReportOptions` are `export`ed from `generateReport.ts` and re-exported via the barrel, so Spec B can name them. ✅

**Note on `User.name`/`email`:** both are non-nullable `String` in `prisma/schema.prisma`, so the quiz columns need no null-coalescing.
