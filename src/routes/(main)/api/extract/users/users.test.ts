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
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { db } from '$lib/server/db.js';

import { GET } from './+server.js';

function makeEvent(
  url = 'http://localhost/api/extract/users',
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
  vi.mocked(db.user.findMany).mockReset();
  vi.mocked(db.user.count).mockReset();
  vi.stubEnv('EXTRACT_API_KEY', 'test-api-key');
  vi.stubEnv('EXTRACT_API_ALLOWED_IPS', '127.0.0.1');
});

describe('extract users GET', () => {
  test('returns paginated users', async () => {
    vi.mocked(db.user.findMany).mockResolvedValue([
      {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        googleProviderId: 'google-1',
        avatarURL: 'https://example.com/alice.png',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-05T00:00:00.000Z'),
      },
    ]);
    vi.mocked(db.user.count).mockResolvedValue(3);

    const response = await GET(
      makeEvent('http://localhost/api/extract/users?page=2&pageSize=1', {
        'x-api-key': 'test-api-key',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(db.user.findMany).toHaveBeenCalledWith(
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
    expect(body.data).toHaveLength(1);
  });

  test('filters users by updatedAt range', async () => {
    vi.mocked(db.user.findMany).mockResolvedValue([]);
    vi.mocked(db.user.count).mockResolvedValue(0);

    const response = await GET(
      makeEvent(
        'http://localhost/api/extract/users?lastUpdatedStart=2026-01-01T00:00:00.000Z&lastUpdatedEnd=2026-01-31T23:59:59.999Z',
        {
          'x-api-key': 'test-api-key',
        },
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(db.user.findMany).toHaveBeenCalledWith(
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

  test('returns bad request for invalid lastUpdatedStart', async () => {
    const response = await GET(
      makeEvent('http://localhost/api/extract/users?lastUpdatedStart=not-a-date', {
        'x-api-key': 'test-api-key',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ message: 'Invalid lastUpdatedStart parameter.' });
    expect(db.user.findMany).not.toHaveBeenCalled();
  });
});
