import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
  env: new Proxy(
    {},
    {
      get: (_target, prop) => process.env[prop as string],
    },
  ),
}));

import { GET } from './+server.js';

function makeEvent(headers: Record<string, string> = {}, clientIp = '127.0.0.1') {
  const childLogger = { warn: vi.fn(), error: vi.fn() };
  const logger = { warn: vi.fn(), error: vi.fn(), child: vi.fn().mockReturnValue(childLogger) };
  return {
    request: new Request('http://localhost/api/internal/hello', { headers }),
    getClientAddress: () => clientIp,
    url: new URL('http://localhost/api/internal/hello'),
    locals: { logger },
  } as never;
}

beforeEach(() => {
  vi.unstubAllEnvs();
});

describe('internal hello GET - IP whitelist', () => {
  test('returns server error when IP whitelist is not configured', async () => {
    vi.stubEnv('INTERNAL_API_KEY', 'test-api-key');
    vi.stubEnv('INTERNAL_API_ALLOWED_IPS', '');

    const response = await GET(makeEvent({ 'x-api-key': 'test-api-key' }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ message: 'IP whitelist is not configured.' });
  });

  test('returns forbidden when client IP is not in whitelist', async () => {
    vi.stubEnv('INTERNAL_API_KEY', 'test-api-key');
    vi.stubEnv('INTERNAL_API_ALLOWED_IPS', '10.0.0.1,10.0.0.2');

    const response = await GET(makeEvent({ 'x-api-key': 'test-api-key' }, '192.168.1.1'));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({ message: 'Forbidden' });
  });

  test('passes IP check when client IP is in whitelist', async () => {
    vi.stubEnv('INTERNAL_API_KEY', 'test-api-key');
    vi.stubEnv('INTERNAL_API_ALLOWED_IPS', '10.0.0.1,10.0.0.2');

    const response = await GET(makeEvent({ 'x-api-key': 'test-api-key' }, '10.0.0.1'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ message: 'Hello, world!' });
  });
});

describe('internal hello GET - API key', () => {
  test('returns unauthorized when api key is missing', async () => {
    vi.stubEnv('INTERNAL_API_KEY', 'test-api-key');
    vi.stubEnv('INTERNAL_API_ALLOWED_IPS', '127.0.0.1');

    const response = await GET(makeEvent());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns unauthorized when api key is invalid', async () => {
    vi.stubEnv('INTERNAL_API_KEY', 'test-api-key');
    vi.stubEnv('INTERNAL_API_ALLOWED_IPS', '127.0.0.1');

    const response = await GET(makeEvent({ 'x-api-key': 'wrong-api-key' }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      message: 'Unauthorized',
    });
  });

  test('returns hello world when api key is valid', async () => {
    vi.stubEnv('INTERNAL_API_KEY', 'test-api-key');
    vi.stubEnv('INTERNAL_API_ALLOWED_IPS', '127.0.0.1');

    const response = await GET(makeEvent({ 'x-api-key': 'test-api-key' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(body).toEqual({
      message: 'Hello, world!',
    });
  });

  test('returns server error when api key is not configured', async () => {
    vi.stubEnv('INTERNAL_API_KEY', '');
    vi.stubEnv('INTERNAL_API_ALLOWED_IPS', '127.0.0.1');

    const response = await GET(makeEvent({ 'x-api-key': 'test-api-key' }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      message: 'Internal API key is not configured.',
    });
  });
});
