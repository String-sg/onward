import { describe, expect, test } from 'vitest';

import { formatDateUtc, loadConfig, objectKey, toNdjson } from './export-nlds.js';

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
