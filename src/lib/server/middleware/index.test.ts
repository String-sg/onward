import type { RequestHandler } from '@sveltejs/kit';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { fallbackChildLogger, fallbackLogger } = vi.hoisted(() => {
  const childLogger = { warn: vi.fn(), error: vi.fn() };
  const logger = { child: vi.fn().mockReturnValue(childLogger) };

  return {
    fallbackChildLogger: childLogger,
    fallbackLogger: logger,
  };
});

vi.mock('$env/dynamic/private', () => ({
  env: new Proxy(
    {},
    {
      get: (_target, prop) => process.env[prop as string],
    },
  ),
}));

vi.mock('$lib/server/logger.js', () => ({
  logger: fallbackLogger,
}));

import {
  composeMiddleware,
  type Middleware,
  withInternalApiKey,
  withIpWhitelist,
} from './index.js';

function makeEvent({
  headers = {},
  clientIp = '127.0.0.1',
  includeRequestLogger = true,
}: {
  headers?: Record<string, string>;
  clientIp?: string;
  includeRequestLogger?: boolean;
} = {}) {
  const childLogger = { warn: vi.fn(), error: vi.fn() };
  const requestLogger = {
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnValue(childLogger),
  };

  return {
    request: new Request('http://localhost/api/extract/test', { headers }),
    getClientAddress: () => clientIp,
    url: new URL('http://localhost/api/extract/test'),
    locals: includeRequestLogger ? { logger: requestLogger } : {},
  } as never;
}

beforeEach(() => {
  vi.unstubAllEnvs();
  fallbackLogger.child.mockClear();
  fallbackChildLogger.warn.mockReset();
  fallbackChildLogger.error.mockReset();
});

describe('composeMiddleware', () => {
  test('composes in expected order', async () => {
    const calls: string[] = [];

    const m1: Middleware = (handler) =>
      (async (event) => {
        calls.push('m1:before');
        const response = await handler(event);
        calls.push('m1:after');
        return response;
      }) satisfies RequestHandler;

    const m2: Middleware = (handler) =>
      (async (event) => {
        calls.push('m2:before');
        const response = await handler(event);
        calls.push('m2:after');
        return response;
      }) satisfies RequestHandler;

    const handler: RequestHandler = async () => {
      calls.push('handler');
      return new Response(null, { status: 204 });
    };

    const composed = composeMiddleware([m1, m2])(handler);
    const response = await composed(makeEvent());

    expect(response.status).toBe(204);
    expect(calls).toEqual(['m1:before', 'm2:before', 'handler', 'm2:after', 'm1:after']);
  });
});

describe('withInternalApiKey', () => {
  test('returns 500 when EXTRACT_API_KEY is not configured (fallback logger path)', async () => {
    const wrapped = withInternalApiKey(async () => new Response(null, { status: 204 }));

    const response = await wrapped(makeEvent({ includeRequestLogger: false }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ message: 'Internal API key is not configured.' });
    expect(fallbackLogger.child).toHaveBeenCalled();
    expect(fallbackChildLogger.error).toHaveBeenCalledWith('EXTRACT_API_KEY is not configured');
  });

  test('returns 401 when API key header is missing', async () => {
    vi.stubEnv('EXTRACT_API_KEY', 'test-api-key');
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const wrapped = withInternalApiKey(handler as never);

    const response = await wrapped(makeEvent());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ message: 'Unauthorized' });
    expect(handler).not.toHaveBeenCalled();
  });

  test('returns 401 when API key length differs', async () => {
    vi.stubEnv('EXTRACT_API_KEY', 'test-api-key');
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const wrapped = withInternalApiKey(handler as never);

    const response = await wrapped(makeEvent({ headers: { 'x-api-key': 'short' } }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ message: 'Unauthorized' });
    expect(handler).not.toHaveBeenCalled();
  });

  test('returns 401 when API key has same length but wrong value', async () => {
    vi.stubEnv('EXTRACT_API_KEY', 'test-api-key');
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const wrapped = withInternalApiKey(handler as never);

    const response = await wrapped(makeEvent({ headers: { 'x-api-key': 'test-api-kex' } }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ message: 'Unauthorized' });
    expect(handler).not.toHaveBeenCalled();
  });

  test('calls handler when API key is valid', async () => {
    vi.stubEnv('EXTRACT_API_KEY', 'test-api-key');
    const handler = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const wrapped = withInternalApiKey(handler as never);

    const response = await wrapped(makeEvent({ headers: { 'x-api-key': 'test-api-key' } }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(handler).toHaveBeenCalledOnce();
  });
});

describe('withIpWhitelist', () => {
  test('returns 500 when EXTRACT_API_ALLOWED_IPS is not configured', async () => {
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const wrapped = withIpWhitelist(handler as never);

    const response = await wrapped(makeEvent());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ message: 'IP whitelist is not configured.' });
    expect(handler).not.toHaveBeenCalled();
  });

  test('returns 403 when client IP is not in whitelist', async () => {
    vi.stubEnv('EXTRACT_API_ALLOWED_IPS', '127.0.0.1,::1');
    const handler = vi.fn(async () => new Response(null, { status: 204 }));
    const wrapped = withIpWhitelist(handler as never);

    const response = await wrapped(makeEvent({ clientIp: '10.0.0.1' }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({ message: 'Forbidden' });
    expect(handler).not.toHaveBeenCalled();
  });

  test('calls handler when client IP is in whitelist (trimmed list)', async () => {
    vi.stubEnv('EXTRACT_API_ALLOWED_IPS', ' 127.0.0.1 , ::1 ');
    const handler = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const wrapped = withIpWhitelist(handler as never);

    const response = await wrapped(makeEvent({ clientIp: '::1' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(handler).toHaveBeenCalledOnce();
  });
});
