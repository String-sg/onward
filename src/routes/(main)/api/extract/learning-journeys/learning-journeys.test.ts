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
    learningJourney: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { db } from '$lib/server/db.js';

import { GET } from './+server.js';

function makeEvent(
  url = 'http://localhost/api/extract/learning-journeys',
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
  vi.mocked(db.learningJourney.findMany).mockReset();
  vi.mocked(db.learningJourney.count).mockReset();
  vi.stubEnv('EXTRACT_API_KEY', 'test-api-key');
  vi.stubEnv('EXTRACT_API_ALLOWED_IPS', '127.0.0.1');
});

describe('extract learning journeys GET', () => {
  test('returns paginated learning journeys', async () => {
    vi.mocked(db.learningJourney.findMany).mockResolvedValue([
      {
        id: 'journey-1',
        userId: 'user-1',
        learningUnitId: 'unit-1',
        isCompleted: false,
        isQuizAttempted: false,
        isQuizPassed: null,
        numberOfAttempts: 0,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-05T00:00:00.000Z'),
      },
    ]);
    vi.mocked(db.learningJourney.count).mockResolvedValue(4);

    const response = await GET(
      makeEvent('http://localhost/api/extract/learning-journeys?page=2&pageSize=2', {
        'x-api-key': 'test-api-key',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(db.learningJourney.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 2,
        take: 2,
        orderBy: { updatedAt: 'asc' },
      }),
    );
    expect(body.pagination).toEqual({
      page: 2,
      pageSize: 2,
      totalCount: 4,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    });
    expect(body.data).toHaveLength(1);
  });

  test('filters learning journeys by updatedAt range', async () => {
    vi.mocked(db.learningJourney.findMany).mockResolvedValue([]);
    vi.mocked(db.learningJourney.count).mockResolvedValue(0);

    const response = await GET(
      makeEvent(
        'http://localhost/api/extract/learning-journeys?lastUpdatedStart=2026-01-01T00:00:00.000Z&lastUpdatedEnd=2026-01-31T23:59:59.999Z',
        {
          'x-api-key': 'test-api-key',
        },
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(db.learningJourney.findMany).toHaveBeenCalledWith(
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

  test('returns bad request for invalid page', async () => {
    const response = await GET(
      makeEvent('http://localhost/api/extract/learning-journeys?page=0', {
        'x-api-key': 'test-api-key',
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ message: 'Invalid page parameter.' });
    expect(db.learningJourney.findMany).not.toHaveBeenCalled();
  });
});
