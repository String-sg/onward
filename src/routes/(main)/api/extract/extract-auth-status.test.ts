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
  db: {},
}));

type ExtractGetHandler = (event: never) => Promise<Response>;

const routes = [
  {
    name: 'collections',
    path: './collections/+server.js',
    url: 'http://localhost/api/extract/collections',
  },
  {
    name: 'learning-journeys',
    path: './learning-journeys/+server.js',
    url: 'http://localhost/api/extract/learning-journeys',
  },
  {
    name: 'learning-unit-collections',
    path: './learning-unit-collections/+server.js',
    url: 'http://localhost/api/extract/learning-unit-collections',
  },
  {
    name: 'learning-unit-sentiments',
    path: './learning-unit-sentiments/+server.js',
    url: 'http://localhost/api/extract/learning-unit-sentiments',
  },
  {
    name: 'learning-units',
    path: './learning-units/+server.js',
    url: 'http://localhost/api/extract/learning-units',
  },
  {
    name: 'users',
    path: './users/+server.js',
    url: 'http://localhost/api/extract/users',
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
});

describe('extract API auth status', () => {
  test.each(routes)('%s returns 401 when API key is missing', async ({ path, url }) => {
    const GET = await loadGetHandler(path);

    const response = await GET(makeEvent(url));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ message: 'Unauthorized' });
  });

  test.each(routes)('%s returns 403 when client IP is not whitelisted', async ({ path, url }) => {
    const GET = await loadGetHandler(path);

    const response = await GET(makeEvent(url, { 'x-api-key': 'test-api-key' }, '10.0.0.1'));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({ message: 'Forbidden' });
  });
});
