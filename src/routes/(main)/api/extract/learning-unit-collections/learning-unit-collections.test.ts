import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: new Proxy(
    {},
    {
      get: (_target, prop) => process.env[prop as string],
    },
  ),
}));

vi.mock('$lib/server/db.js', () => ({
  db: {
    learningUnitCollection: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { db } from '$lib/server/db.js';

import { GET } from './+server.js';

function makeEvent(
  url = 'http://localhost/api/extract/learning-unit-collections',
  headers: Record<string, string> = {},
  clientIp = '127.0.0.1',
) {
  const childLogger = { warn: vi.fn(), error: vi.fn() };
  const logger = { warn: vi.fn(), error: vi.fn(), child: vi.fn().mockReturnValue(childLogger) };
  return {
    request: new Request(url, { headers }),
    getClientAddress: () => clientIp,
    url: new URL(url),
    locals: { logger },
  } as never;
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.mocked(db.learningUnitCollection.findMany).mockReset();
  vi.mocked(db.learningUnitCollection.count).mockReset();
  vi.stubEnv('EXTRACT_API_KEY', 'test-api-key');
  vi.stubEnv('EXTRACT_API_ALLOWED_IPS', '127.0.0.1');
});

describe('extract learning unit collections GET', () => {
  test('returns paginated learning unit collections', async () => {
    vi.mocked(db.learningUnitCollection.findMany).mockResolvedValue([
      {
        learningUnitId: 'unit-1',
        collectionId: 'collection-1',
      },
    ]);
    vi.mocked(db.learningUnitCollection.count).mockResolvedValue(3);

    const response = await GET(
      makeEvent('http://localhost/api/extract/learning-unit-collections?page=2&pageSize=1', {
        'x-api-key': 'test-api-key',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(db.learningUnitCollection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 1,
        take: 1,
        orderBy: [{ learningUnitId: 'asc' }, { collectionId: 'asc' }],
      }),
    );
    expect(body.pagination).toEqual({
      page: 2,
      pageSize: 1,
      totalCount: 3,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  test('returns bad request for unsupported lastUpdated filters', async () => {
    const response = await GET(
      makeEvent(
        'http://localhost/api/extract/learning-unit-collections?lastUpdatedStart=2026-01-01T00:00:00.000Z',
        {
          'x-api-key': 'test-api-key',
        },
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      message:
        'lastUpdatedStart and lastUpdatedEnd filters are not supported for learning unit collections.',
    });
    expect(db.learningUnitCollection.findMany).not.toHaveBeenCalled();
  });

  test('returns bad request for invalid page', async () => {
    const response = await GET(
      makeEvent('http://localhost/api/extract/learning-unit-collections?page=0', {
        'x-api-key': 'test-api-key',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ message: 'Invalid page parameter.' });
    expect(db.learningUnitCollection.findMany).not.toHaveBeenCalled();
  });
});
