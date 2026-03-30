import { beforeEach, describe, expect, test, vi } from 'vitest';

const { dbMock } = vi.hoisted(() => ({
  dbMock: {
    collection: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    learningJourney: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    learningUnitCollection: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    learningUnitSentiments: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    learningUnit: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('$env/dynamic/private', () => ({
  env: new Proxy(
    {},
    {
      get: (_target, prop) => process.env[prop as string],
    },
  ),
}));

vi.mock('$lib/server/db.js', () => ({
  db: dbMock,
}));

type ExtractGetHandler = (event: never) => Promise<Response>;
type DbModelKey = keyof typeof dbMock;

const routes = [
  {
    name: 'collections',
    path: './collections/+server.js',
    url: 'http://localhost/api/extract/collections',
    model: 'collection' as DbModelKey,
    supportsUpdatedAtFilters: true,
    failureMessage: 'Failed to extract collections.',
  },
  {
    name: 'learning-journeys',
    path: './learning-journeys/+server.js',
    url: 'http://localhost/api/extract/learning-journeys',
    model: 'learningJourney' as DbModelKey,
    supportsUpdatedAtFilters: true,
    failureMessage: 'Failed to extract learning journeys.',
  },
  {
    name: 'learning-unit-collections',
    path: './learning-unit-collections/+server.js',
    url: 'http://localhost/api/extract/learning-unit-collections',
    model: 'learningUnitCollection' as DbModelKey,
    supportsUpdatedAtFilters: false,
    failureMessage: 'Failed to extract learning unit collections.',
  },
  {
    name: 'learning-unit-sentiments',
    path: './learning-unit-sentiments/+server.js',
    url: 'http://localhost/api/extract/learning-unit-sentiments',
    model: 'learningUnitSentiments' as DbModelKey,
    supportsUpdatedAtFilters: true,
    failureMessage: 'Failed to extract learning unit sentiments.',
  },
  {
    name: 'learning-units',
    path: './learning-units/+server.js',
    url: 'http://localhost/api/extract/learning-units',
    model: 'learningUnit' as DbModelKey,
    supportsUpdatedAtFilters: true,
    failureMessage: 'Failed to extract learning units.',
  },
  {
    name: 'users',
    path: './users/+server.js',
    url: 'http://localhost/api/extract/users',
    model: 'user' as DbModelKey,
    supportsUpdatedAtFilters: true,
    failureMessage: 'Failed to extract users.',
  },
] as const;

function makeEvent(url: string, headers: Record<string, string> = {}, clientIp = '127.0.0.1') {
  const childLogger = { warn: vi.fn(), error: vi.fn() };
  const logger = { warn: vi.fn(), error: vi.fn(), child: vi.fn().mockReturnValue(childLogger) };

  return {
    request: new Request(url, { headers }),
    getClientAddress: () => clientIp,
    url: new URL(url),
    locals: { logger },
  } as never;
}

async function loadGetHandler(path: string): Promise<ExtractGetHandler> {
  const module = (await import(path)) as { GET: ExtractGetHandler };
  return module.GET;
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv('EXTRACT_API_KEY', 'test-api-key');
  vi.stubEnv('EXTRACT_API_ALLOWED_IPS', '127.0.0.1,::1');

  for (const model of Object.values(dbMock)) {
    model.findMany.mockReset();
    model.count.mockReset();
    model.findMany.mockResolvedValue([]);
    model.count.mockResolvedValue(0);
  }
});

describe('extract API query validation and failures', () => {
  test.each(routes)('%s returns 400 for invalid page', async ({ path, url }) => {
    const GET = await loadGetHandler(path);

    const response = await GET(makeEvent(`${url}?page=0`, { 'x-api-key': 'test-api-key' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ message: 'Invalid page parameter.' });
  });

  test.each(routes)('%s returns 400 for invalid pageSize', async ({ path, url }) => {
    const GET = await loadGetHandler(path);

    const response = await GET(makeEvent(`${url}?pageSize=0`, { 'x-api-key': 'test-api-key' }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ message: 'Invalid pageSize parameter.' });
  });

  test.each(routes.filter((route) => route.supportsUpdatedAtFilters))(
    '%s returns 400 for invalid lastUpdatedStart',
    async ({ path, url }) => {
      const GET = await loadGetHandler(path);

      const response = await GET(
        makeEvent(`${url}?lastUpdatedStart=not-a-date`, { 'x-api-key': 'test-api-key' }),
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({ message: 'Invalid lastUpdatedStart parameter.' });
    },
  );

  test.each(routes.filter((route) => route.supportsUpdatedAtFilters))(
    '%s returns 400 for invalid lastUpdatedEnd',
    async ({ path, url }) => {
      const GET = await loadGetHandler(path);

      const response = await GET(
        makeEvent(`${url}?lastUpdatedEnd=not-a-date`, { 'x-api-key': 'test-api-key' }),
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({ message: 'Invalid lastUpdatedEnd parameter.' });
    },
  );

  test.each(routes)(
    '%s returns 500 when query fails',
    async ({ path, url, model, failureMessage }) => {
      dbMock[model].findMany.mockRejectedValueOnce(new Error('db error'));
      const GET = await loadGetHandler(path);

      const response = await GET(makeEvent(url, { 'x-api-key': 'test-api-key' }));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: failureMessage });
    },
  );
});
