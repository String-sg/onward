import { describe, expect, test, vi } from 'vitest';

import {
  formatDateUtc,
  loadConfig,
  mandatoryQuizOutcomesDataset,
  objectKey,
  toNdjson,
  usersDataset,
} from './export-nlds.js';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
