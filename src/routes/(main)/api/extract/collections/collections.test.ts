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
    collection: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { db } from '$lib/server/db.js';

import { GET } from './+server.js';

function makeEvent(
  url = 'http://localhost/api/extract/collections',
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
  vi.mocked(db.collection.findMany).mockReset();
  vi.mocked(db.collection.count).mockReset();
  vi.stubEnv('EXTRACT_API_KEY', 'test-api-key');
  vi.stubEnv('EXTRACT_API_ALLOWED_IPS', '127.0.0.1');
});

describe('extract collections GET', () => {
  test('returns paginated collections', async () => {
    vi.mocked(db.collection.findMany).mockResolvedValue([
      {
        id: 'collection-1',
        title: 'Collection A',
        description: 'Description',
        tagId: null,
        isTopic: false,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-05T00:00:00.000Z'),
      },
    ]);
    vi.mocked(db.collection.count).mockResolvedValue(3);

    const response = await GET(
      makeEvent('http://localhost/api/extract/collections?page=2&pageSize=1', {
        'x-api-key': 'test-api-key',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(db.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 1,
        take: 1,
        orderBy: { updatedAt: 'asc' },
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

  test('filters collections by updatedAt range', async () => {
    vi.mocked(db.collection.findMany).mockResolvedValue([]);
    vi.mocked(db.collection.count).mockResolvedValue(0);

    const response = await GET(
      makeEvent(
        'http://localhost/api/extract/collections?lastUpdatedStart=2026-01-01T00:00:00.000Z&lastUpdatedEnd=2026-01-31T23:59:59.999Z',
        {
          'x-api-key': 'test-api-key',
        },
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(db.collection.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          updatedAt: {
            gte: new Date('2026-01-01T00:00:00.000Z'),
            lte: new Date('2026-01-31T23:59:59.999Z'),
          },
        },
      }),
    );
    expect(body.filters).toEqual({
      lastUpdatedStart: '2026-01-01T00:00:00.000Z',
      lastUpdatedEnd: '2026-01-31T23:59:59.999Z',
    });
  });

  test('returns bad request for invalid pageSize', async () => {
    const response = await GET(
      makeEvent('http://localhost/api/extract/collections?pageSize=0', {
        'x-api-key': 'test-api-key',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ message: 'Invalid pageSize parameter.' });
    expect(db.collection.findMany).not.toHaveBeenCalled();
  });
});
