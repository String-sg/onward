# NLDS Mandatory-Quiz-Completion Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a daily batch script that exports a full snapshot of users and mandatory-module quiz outcomes from the Onward DB to the NLDS S3 data lake as NDJSON, encrypted with SSE-KMS.

**Architecture:** A single standalone entry module `scripts/export-nlds.ts` implements small, individually-testable units (config loader, dataset definitions, NDJSON serializer, S3 uploader, orchestrator). It instantiates its own Prisma client over `@prisma/adapter-pg` (mirroring `prisma/seed.ts`, not the SvelteKit `$lib/server/db` module). Per [ADR-0006](../../decisions/0006-package-nlds-export-as-bundled-script-in-app-image.md) it is bundled at Docker build time to `build/export-nlds.js` (generated Prisma client inlined; AWS SDK + Prisma runtime left external) and run by bare Node.

**Tech Stack:** TypeScript, Node 24 (ESM), Prisma 7 + `@prisma/adapter-pg`, `@aws-sdk/client-s3`, esbuild (build-stage bundler, devDep), Vitest.

## Global Constraints

- **Runtime deps:** only Prisma and `@aws-sdk/client-s3` may be used at runtime. `esbuild` is a **devDependency**, build-stage only — never shipped to the production image stage. Do NOT import `dotenv` or `tsx` in the script.
- **Invocation contract (fixed by infra):** command is `pnpm run export:nlds`; exit `0` on full success, non-zero on any failure; Node/ARM64, no shell tools.
- **Env vars (injected):** `POSTGRES_URL`, `NLDS_BUCKET`, `NLDS_PREFIX` (e.g. `glow/`), `NLDS_KMS_KEY_ID`, `AWS_REGION`. All required; no defaults.
- **SSE-KMS mandatory** on every `PutObject`: `ServerSideEncryption: 'aws:kms'` + `SSEKMSKeyId`. The bucket rejects non-KMS puts.
- **Prefix scoping:** never construct an S3 key outside `NLDS_PREFIX`.
- **Read-only DB:** `select` queries only; never write the source DB. No `SELECT *` — explicit columns only.
- **Output:** NDJSON (one `JSON.stringify` per line, `\n`-terminated incl. last line, UTF-8). Keys: `${NLDS_PREFIX}users/${YYYY-MM-DD}.ndjson` and `${NLDS_PREFIX}mandatory_quiz_outcomes/${YYYY-MM-DD}.ndjson`, date in **UTC**.
- **Commit style:** Conventional Commits (`feat:`, `chore:`, `docs:`). End every commit message with the trailer `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **Prisma query args** order keys in SQL clause order (`select`, `where`, `orderBy`, …); type args with generated `*FindManyArgs` via `satisfies` and derive rows with `*GetPayload`.

## GitHub Workflow (document-only; run only when the user explicitly asks)

No tracking issue exists for this work. The gh steps, in order:

1. Create the feature branch: `git checkout -b feat/nlds-export`
2. After Task 1's first commit, push and open a **draft** PR:
   `gh pr create --draft --title "feat: NLDS mandatory-quiz-completion export" --body-file <filled PR template>` (body per `.github/PULL_REQUEST_TEMPLATE.md`).
3. Final step (after Task 6 passes): `gh pr ready`.

Writing these into the plan is not running them. Create no branch/commit/push/PR until the user explicitly asks.

---

### Task 1: Config loader + key/date helpers (pure functions)

Establishes the module file and the three pure, I/O-free units. This task also carries the initial project wiring (the test file) since later tasks build on these exports.

**Files:**

- Create: `scripts/export-nlds.ts`
- Test: `scripts/export-nlds.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `interface ExportConfig { postgresUrl: string; bucket: string; prefix: string; kmsKeyId: string; region: string; }`
  - `loadConfig(env: NodeJS.ProcessEnv): ExportConfig`
  - `objectKey(prefix: string, dataset: string, date: string): string`
  - `formatDateUtc(now: Date): string`

- [ ] **Step 1: Write the failing tests**

Create `scripts/export-nlds.test.ts`:

```ts
import { describe, expect, test } from 'vitest';

import { formatDateUtc, loadConfig, objectKey } from './export-nlds.js';

const fullEnv = {
  POSTGRES_URL: 'postgresql://u:p@localhost:5432/db',
  NLDS_BUCKET: 'nlds-bucket',
  NLDS_PREFIX: 'glow/',
  NLDS_KMS_KEY_ID: 'arn:aws:kms:ap-southeast-1:1:key/abc',
  AWS_REGION: 'ap-southeast-1',
} satisfies NodeJS.ProcessEnv;

describe('loadConfig', () => {
  test('returns a fully-populated config when all vars are present', () => {
    expect(loadConfig(fullEnv)).toEqual({
      postgresUrl: 'postgresql://u:p@localhost:5432/db',
      bucket: 'nlds-bucket',
      prefix: 'glow/',
      kmsKeyId: 'arn:aws:kms:ap-southeast-1:1:key/abc',
      region: 'ap-southeast-1',
    });
  });

  test('throws naming the missing var', () => {
    const { NLDS_KMS_KEY_ID, ...missing } = fullEnv;
    expect(() => loadConfig(missing)).toThrow('NLDS_KMS_KEY_ID');
  });

  test('treats an empty-string var as missing', () => {
    expect(() => loadConfig({ ...fullEnv, NLDS_BUCKET: '' })).toThrow('NLDS_BUCKET');
  });
});

describe('objectKey', () => {
  test('composes prefix + dataset + date + .ndjson', () => {
    expect(objectKey('glow/', 'users', '2026-07-01')).toBe('glow/users/2026-07-01.ndjson');
  });
});

describe('formatDateUtc', () => {
  test('formats as UTC YYYY-MM-DD', () => {
    expect(formatDateUtc(new Date('2026-07-01T13:30:00Z'))).toBe('2026-07-01');
  });

  test('uses UTC, not local time, near a day boundary', () => {
    expect(formatDateUtc(new Date('2026-07-01T23:30:00Z'))).toBe('2026-07-01');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test run scripts/export-nlds.test.ts`
Expected: FAIL — cannot resolve `./export-nlds.ts` / exports not defined.

- [ ] **Step 3: Create the module with the three units**

Create `scripts/export-nlds.ts`:

```ts
export interface ExportConfig {
  postgresUrl: string;
  bucket: string;
  prefix: string;
  kmsKeyId: string;
  region: string;
}

const REQUIRED_VARS = [
  'POSTGRES_URL',
  'NLDS_BUCKET',
  'NLDS_PREFIX',
  'NLDS_KMS_KEY_ID',
  'AWS_REGION',
] as const;

function requireVar(env: NodeJS.ProcessEnv, name: (typeof REQUIRED_VARS)[number]): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv): ExportConfig {
  return {
    postgresUrl: requireVar(env, 'POSTGRES_URL'),
    bucket: requireVar(env, 'NLDS_BUCKET'),
    prefix: requireVar(env, 'NLDS_PREFIX'),
    kmsKeyId: requireVar(env, 'NLDS_KMS_KEY_ID'),
    region: requireVar(env, 'AWS_REGION'),
  };
}

export function objectKey(prefix: string, dataset: string, date: string): string {
  return `${prefix}${dataset}/${date}.ndjson`;
}

export function formatDateUtc(now: Date): string {
  return now.toISOString().slice(0, 10);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test run scripts/export-nlds.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/export-nlds.ts scripts/export-nlds.test.ts
git commit -m "feat(export): add NLDS export config loader and key helpers

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: NDJSON serializer

**Files:**

- Modify: `scripts/export-nlds.ts`
- Test: `scripts/export-nlds.test.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: `toNdjson(rows: ReadonlyArray<Record<string, unknown>>): string`

- [ ] **Step 1: Write the failing tests**

Append to `scripts/export-nlds.test.ts` (add `toNdjson` to the existing import from `./export-nlds.ts`):

```ts
describe('toNdjson', () => {
  test('serializes each row as its own newline-terminated JSON line', () => {
    const out = toNdjson([{ a: 1 }, { a: 2 }]);
    expect(out).toBe('{"a":1}\n{"a":2}\n');
  });

  test('returns empty string for no rows', () => {
    expect(toNdjson([])).toBe('');
  });

  test('preserves null fields (does not coerce to empty string)', () => {
    expect(toNdjson([{ a: null }])).toBe('{"a":null}\n');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test run scripts/export-nlds.test.ts -t toNdjson`
Expected: FAIL — `toNdjson` is not exported.

- [ ] **Step 3: Implement `toNdjson`**

Add to `scripts/export-nlds.ts`:

```ts
export function toNdjson(rows: ReadonlyArray<Record<string, unknown>>): string {
  return rows.map((row) => `${JSON.stringify(row)}\n`).join('');
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test run scripts/export-nlds.test.ts -t toNdjson`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/export-nlds.ts scripts/export-nlds.test.ts
git commit -m "feat(export): add NDJSON serializer

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Dataset definitions (users + mandatory quiz outcomes)

**Files:**

- Modify: `scripts/export-nlds.ts`
- Test: `scripts/export-nlds.test.ts`

**Interfaces:**

- Consumes: `PrismaClient` type from `../src/generated/prisma/client.js`.
- Produces:
  - `interface Dataset<Row extends Record<string, unknown>> { readonly name: string; fetch(client: PrismaClient): Promise<Row[]>; }`
  - `usersDataset: Dataset<UserRow>` (name `'users'`; `select` id, name, email, created_at)
  - `mandatoryQuizOutcomesDataset: Dataset<MandatoryQuizOutcomeRow>` (name `'mandatory_quiz_outcomes'`; journeys where `learningUnit.is_required = true`)
  - `datasets: ReadonlyArray<Dataset<Record<string, unknown>>>`

- [ ] **Step 1: Write the failing tests**

Append to `scripts/export-nlds.test.ts`. Add `vi` to the vitest import (`import { describe, expect, test, vi } from 'vitest';`) and add `mandatoryQuizOutcomesDataset, usersDataset` to the `./export-nlds.ts` import.

```ts
describe('usersDataset', () => {
  test('selects exactly the four identity fields and maps to snake_case rows', async () => {
    const findMany = vi
      .fn()
      .mockResolvedValue([
        { id: 'u1', name: 'Ada', email: 'ada@x.gov', createdAt: new Date('2026-01-02T00:00:00Z') },
      ]);
    const client = {
      user: { findMany },
    } as unknown as import('../src/generated/prisma/client.js').PrismaClient;

    const rows = await usersDataset.fetch(client);

    expect(findMany).toHaveBeenCalledWith({
      select: { id: true, name: true, email: true, createdAt: true },
    });
    expect(rows).toEqual([
      { id: 'u1', name: 'Ada', email: 'ada@x.gov', created_at: '2026-01-02T00:00:00.000Z' },
    ]);
  });
});

describe('mandatoryQuizOutcomesDataset', () => {
  test('filters to required units and projects the nine fields as snake_case', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        userId: 'u1',
        learningUnitId: 'lu1',
        isCompleted: true,
        isQuizAttempted: true,
        isQuizPassed: null,
        numberOfAttempts: 2,
        updatedAt: new Date('2026-06-30T10:00:00Z'),
        learningUnit: { title: 'Cyber Hygiene', dueDate: new Date('2026-12-31T00:00:00Z') },
      },
    ]);
    const client = {
      learningJourney: { findMany },
    } as unknown as import('../src/generated/prisma/client.js').PrismaClient;

    const rows = await mandatoryQuizOutcomesDataset.fetch(client);

    expect(findMany).toHaveBeenCalledWith({
      select: {
        userId: true,
        learningUnitId: true,
        isCompleted: true,
        isQuizAttempted: true,
        isQuizPassed: true,
        numberOfAttempts: true,
        updatedAt: true,
        learningUnit: { select: { title: true, dueDate: true } },
      },
      where: { learningUnit: { isRequired: true } },
    });
    expect(rows).toEqual([
      {
        user_id: 'u1',
        learning_unit_id: 'lu1',
        learning_unit_title: 'Cyber Hygiene',
        due_date: '2026-12-31',
        is_completed: true,
        is_quiz_attempted: true,
        is_quiz_passed: null,
        number_of_attempts: 2,
        updated_at: '2026-06-30T10:00:00.000Z',
      },
    ]);
  });

  test('emits null due_date when the unit has none', async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        userId: 'u1',
        learningUnitId: 'lu1',
        isCompleted: false,
        isQuizAttempted: false,
        isQuizPassed: null,
        numberOfAttempts: 0,
        updatedAt: new Date('2026-06-30T10:00:00Z'),
        learningUnit: { title: 'AI Literacy', dueDate: null },
      },
    ]);
    const client = {
      learningJourney: { findMany },
    } as unknown as import('../src/generated/prisma/client.js').PrismaClient;

    const [row] = await mandatoryQuizOutcomesDataset.fetch(client);

    expect(row.due_date).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test run scripts/export-nlds.test.ts -t Dataset`
Expected: FAIL — datasets not exported.

- [ ] **Step 3: Implement the datasets**

Add to `scripts/export-nlds.ts` (put the type import with the other imports at the top of the file):

```ts
import { type PrismaClient } from '../src/generated/prisma/client.js';

export interface Dataset<Row extends Record<string, unknown>> {
  readonly name: string;
  fetch(client: PrismaClient): Promise<Row[]>;
}

interface UserRow extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface MandatoryQuizOutcomeRow extends Record<string, unknown> {
  user_id: string;
  learning_unit_id: string;
  learning_unit_title: string;
  due_date: string | null;
  is_completed: boolean;
  is_quiz_attempted: boolean;
  is_quiz_passed: boolean | null;
  number_of_attempts: number;
  updated_at: string;
}

export const usersDataset: Dataset<UserRow> = {
  name: 'users',
  async fetch(client) {
    const rows = await client.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      created_at: r.createdAt.toISOString(),
    }));
  },
};

export const mandatoryQuizOutcomesDataset: Dataset<MandatoryQuizOutcomeRow> = {
  name: 'mandatory_quiz_outcomes',
  async fetch(client) {
    const rows = await client.learningJourney.findMany({
      select: {
        userId: true,
        learningUnitId: true,
        isCompleted: true,
        isQuizAttempted: true,
        isQuizPassed: true,
        numberOfAttempts: true,
        updatedAt: true,
        learningUnit: { select: { title: true, dueDate: true } },
      },
      where: { learningUnit: { isRequired: true } },
    });
    return rows.map((r) => ({
      user_id: r.userId,
      learning_unit_id: r.learningUnitId,
      learning_unit_title: r.learningUnit.title,
      due_date: r.learningUnit.dueDate ? r.learningUnit.dueDate.toISOString().slice(0, 10) : null,
      is_completed: r.isCompleted,
      is_quiz_attempted: r.isQuizAttempted,
      is_quiz_passed: r.isQuizPassed,
      number_of_attempts: r.numberOfAttempts,
      updated_at: r.updatedAt.toISOString(),
    }));
  },
};

export const datasets: ReadonlyArray<Dataset<Record<string, unknown>>> = [
  usersDataset,
  mandatoryQuizOutcomesDataset,
];
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test run scripts/export-nlds.test.ts -t Dataset`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/export-nlds.ts scripts/export-nlds.test.ts
git commit -m "feat(export): define users and mandatory quiz outcomes datasets

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: S3 uploader with mandatory SSE-KMS

**Files:**

- Modify: `scripts/export-nlds.ts`
- Test: `scripts/export-nlds.test.ts`

**Interfaces:**

- Consumes: `ExportConfig` (Task 1); `S3Client`, `PutObjectCommand` from `@aws-sdk/client-s3`.
- Produces: `putObject(client: S3Client, cfg: ExportConfig, key: string, body: string): Promise<void>`

- [ ] **Step 1: Write the failing test**

Append to `scripts/export-nlds.test.ts` (add `putObject` to the `./export-nlds.ts` import):

```ts
describe('putObject', () => {
  test('sends the object with SSE-KMS, correct bucket/key and NDJSON content type', async () => {
    const send = vi.fn().mockResolvedValue({});
    const client = { send } as unknown as import('@aws-sdk/client-s3').S3Client;
    const cfg = {
      postgresUrl: 'x',
      bucket: 'nlds-bucket',
      prefix: 'glow/',
      kmsKeyId: 'arn:kms:key',
      region: 'ap-southeast-1',
    };

    await putObject(client, cfg, 'glow/users/2026-07-01.ndjson', '{"a":1}\n');

    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0][0];
    expect(command.input).toEqual({
      Bucket: 'nlds-bucket',
      Key: 'glow/users/2026-07-01.ndjson',
      Body: '{"a":1}\n',
      ContentType: 'application/x-ndjson',
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: 'arn:kms:key',
    });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test run scripts/export-nlds.test.ts -t putObject`
Expected: FAIL — `putObject` not exported.

- [ ] **Step 3: Implement `putObject`**

Add the import at the top of `scripts/export-nlds.ts` and the function:

```ts
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
```

```ts
export async function putObject(
  client: S3Client,
  cfg: ExportConfig,
  key: string,
  body: string,
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: cfg.bucket,
      Key: key,
      Body: body,
      ContentType: 'application/x-ndjson',
      ServerSideEncryption: 'aws:kms',
      SSEKMSKeyId: cfg.kmsKeyId,
    }),
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test run scripts/export-nlds.test.ts -t putObject`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/export-nlds.ts scripts/export-nlds.test.ts
git commit -m "feat(export): add SSE-KMS S3 uploader

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Orchestrator (`main`) + entry wrapper + client wiring

**Files:**

- Modify: `scripts/export-nlds.ts`
- Test: `scripts/export-nlds.test.ts`

**Interfaces:**

- Consumes: everything above; `PrismaClient`, `PrismaPg`.
- Produces: `runExport(deps: { client: PrismaClient; s3: S3Client; cfg: ExportConfig; now: Date }): Promise<DatasetResult[]>` where `interface DatasetResult { name: string; key: string; rowCount: number; }`. `runExport` is the testable core; `main()` builds real clients from env and calls it; a bottom-of-file guard runs `main()` only when executed as the entrypoint.

- [ ] **Step 1: Write the failing tests**

Append to `scripts/export-nlds.test.ts` (add `runExport` to the `./export-nlds.ts` import):

```ts
describe('runExport', () => {
  const cfg = {
    postgresUrl: 'x',
    bucket: 'nlds-bucket',
    prefix: 'glow/',
    kmsKeyId: 'arn:kms:key',
    region: 'ap-southeast-1',
  };

  test('uploads both datasets under dated keys and returns their row counts', async () => {
    const client = {
      user: {
        findMany: vi
          .fn()
          .mockResolvedValue([
            { id: 'u1', name: 'Ada', email: 'a@x', createdAt: new Date('2026-01-01T00:00:00Z') },
          ]),
      },
      learningJourney: { findMany: vi.fn().mockResolvedValue([]) },
    } as unknown as import('../src/generated/prisma/client.js').PrismaClient;
    const send = vi.fn().mockResolvedValue({});
    const s3 = { send } as unknown as import('@aws-sdk/client-s3').S3Client;

    const results = await runExport({ client, s3, cfg, now: new Date('2026-07-01T00:00:00Z') });

    expect(results).toEqual([
      { name: 'users', key: 'glow/users/2026-07-01.ndjson', rowCount: 1 },
      {
        name: 'mandatory_quiz_outcomes',
        key: 'glow/mandatory_quiz_outcomes/2026-07-01.ndjson',
        rowCount: 0,
      },
    ]);
    expect(send).toHaveBeenCalledTimes(2);
  });

  test('propagates an upload failure (aborting the run)', async () => {
    const client = {
      user: { findMany: vi.fn().mockResolvedValue([]) },
      learningJourney: { findMany: vi.fn().mockResolvedValue([]) },
    } as unknown as import('../src/generated/prisma/client.js').PrismaClient;
    const send = vi.fn().mockRejectedValue(new Error('AccessDenied'));
    const s3 = { send } as unknown as import('@aws-sdk/client-s3').S3Client;

    await expect(
      runExport({ client, s3, cfg, now: new Date('2026-07-01T00:00:00Z') }),
    ).rejects.toThrow('AccessDenied');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test run scripts/export-nlds.test.ts -t runExport`
Expected: FAIL — `runExport` not exported.

- [ ] **Step 3: Implement `runExport`, `main`, and the entry guard**

Add the imports at the top of `scripts/export-nlds.ts`:

```ts
import { fileURLToPath } from 'node:url';
import process from 'node:process';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client.js';
```

(Change the earlier `import { type PrismaClient }` to a value import as shown, since `main` now constructs one.)

Add:

```ts
export interface DatasetResult {
  name: string;
  key: string;
  rowCount: number;
}

export async function runExport(deps: {
  client: PrismaClient;
  s3: S3Client;
  cfg: ExportConfig;
  now: Date;
}): Promise<DatasetResult[]> {
  const { client, s3, cfg, now } = deps;
  const date = formatDateUtc(now);
  const results: DatasetResult[] = [];
  for (const dataset of datasets) {
    const rows = await dataset.fetch(client);
    const key = objectKey(cfg.prefix, dataset.name, date);
    await putObject(s3, cfg, key, toNdjson(rows));
    results.push({ name: dataset.name, key, rowCount: rows.length });
  }
  return results;
}

async function main(): Promise<void> {
  const cfg = loadConfig(process.env);
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: cfg.postgresUrl }),
  });
  const s3 = new S3Client({ region: cfg.region });
  try {
    const results = await runExport({ client, s3, cfg, now: new Date() });
    for (const r of results) {
      console.log(`exported ${r.rowCount} rows -> s3://${cfg.bucket}/${r.key}`);
    }
  } finally {
    await client.$disconnect();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('NLDS export failed:', err);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Run the full test file to verify everything passes**

Run: `pnpm test run scripts/export-nlds.test.ts`
Expected: PASS (all tests across Tasks 1–5).

- [ ] **Step 5: Type-check**

Run: `pnpm check`
Expected: no errors. (If `scripts/` is not covered by `tsconfig`, the check still validates the file via `allowJs`/`checkJs` include; fix any reported type errors before committing.)

- [ ] **Step 6: Commit**

```bash
git add scripts/export-nlds.ts scripts/export-nlds.test.ts
git commit -m "feat(export): add export orchestrator and entrypoint

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Packaging — npm scripts, esbuild devDep, Dockerfile bundling

Wires the fixed `pnpm run export:nlds` command and the build-time bundling per ADR-0006. Ends with a real bundle + local run against the dev DB (the acceptance check).

**Files:**

- Modify: `package.json`
- Modify: `Dockerfile:42-46`

**Interfaces:**

- Consumes: `scripts/export-nlds.ts` (Task 5).
- Produces: `build/export-nlds.js` (bundled), `pnpm run export:nlds` entrypoint.

- [ ] **Step 1: Add esbuild as a devDependency**

Run: `pnpm add -D esbuild`
Expected: `esbuild` appears under `devDependencies` in `package.json` and `pnpm-lock.yaml` updates.

- [ ] **Step 2: Add the npm scripts**

Edit `package.json` `scripts` — add these two entries:

```json
    "export:nlds:bundle": "esbuild scripts/export-nlds.ts --bundle --platform=node --format=esm --target=node24 --packages=external --outfile=build/export-nlds.js",
    "export:nlds": "node build/export-nlds.js",
```

Note: `--packages=external` keeps `@aws-sdk/client-s3`, `@prisma/adapter-pg`, `@prisma/client`, and `pg` external (resolved from prod `node_modules`); only `scripts/export-nlds.ts` and the relatively-imported generated Prisma client are inlined.

- [ ] **Step 3: Verify the bundle builds and runs end-to-end (acceptance)**

Start local infra if needed (`docker compose up -d` for Postgres + MinIO per README), seed if needed (`pnpm db:seed`), then:

```bash
pnpm export:nlds:bundle
NLDS_BUCKET=onward NLDS_PREFIX=test/ NLDS_KMS_KEY_ID=<local-key-or-alias> AWS_REGION=ap-southeast-1 \
  node --env-file=.env build/export-nlds.js
```

Expected: two `exported N rows -> s3://onward/test/...ndjson` log lines and exit code `0` (`echo $?` → `0`).

If your local S3 is MinIO (no KMS), point at the real dev bucket/prefix and KMS key instead, or accept that the SSE-KMS assertion requires a KMS-capable target — the acceptance is that a KMS-capable target produces the objects and exits `0`.

- [ ] **Step 4: Verify the failure path exits non-zero**

Run (omit a required var):

```bash
NLDS_BUCKET=onward NLDS_PREFIX=test/ AWS_REGION=ap-southeast-1 node --env-file=.env build/export-nlds.js; echo $?
```

Expected: logs `NLDS export failed: ... NLDS_KMS_KEY_ID` and prints a non-zero exit code.

- [ ] **Step 5: Add the Dockerfile bundling step**

In `Dockerfile`, in the build stage, insert the bundle step after `pnpm build` (line 42) and **before** the production-dependency prune (lines 45–46), so `esbuild` (a devDep) is still installed:

```dockerfile
# Build the app.
RUN pnpm build

# Bundle the NLDS export script into build/ (see ADR-0006).
RUN pnpm export:nlds:bundle

# Install production dependencies.
RUN find . -type d -name "node_modules" -prune -exec rm -rf {} +
RUN pnpm install --offline --prod
```

`build/export-nlds.js` is carried into the production stage by the existing `COPY --from=build … /app/build ./build`; no new `COPY` line is needed.

- [ ] **Step 6: Verify the image build produces and runs the bundle**

Run:

```bash
docker build -t onward-nlds-test .
docker run --rm --entrypoint node onward-nlds-test build/export-nlds.js; echo $?
```

Expected: the script starts and fails on missing env (non-zero) — proving the bundle exists and is runnable in the prod image with only prod deps present. (A full success run requires DB + bucket env wired into the container.)

- [ ] **Step 7: Run the full test + type check once more**

Run: `pnpm test run scripts/export-nlds.test.ts && pnpm check`
Expected: PASS, no type errors.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml Dockerfile
git commit -m "chore(export): wire export:nlds command and build-time bundling

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Notes / Risks

- **Prisma 7 client bundling:** the generated client is inlined; its runtime library (`@prisma/client`) and the query compiler stay **external** (present in prod `node_modules`). If the image run in Task 6 Step 6 fails to load a runtime/wasm asset, the fix is to keep more of `@prisma/*` external (already the default via `--packages=external`) — do not inline the Prisma runtime. Task 6 Step 6 is the gate that catches this before merge.
- **Memory:** each dataset is buffered fully in memory before upload. Acceptable at current table sizes; if volume grows, switch `putObject` to a streamed multipart upload — an internal change that does not alter its signature.
- **`.ts` extension in imports:** this repo's test imports use `./file.js` for runtime modules; the plan's test imports use `./export-nlds.ts` / `../src/generated/prisma/client.js` to match the actual on-disk extension under Vite's resolver. If `pnpm check`/`pnpm test` complains about the extension, align it with the repo's prevailing convention (`.js`) — verify against a neighboring passing test.

```

```
