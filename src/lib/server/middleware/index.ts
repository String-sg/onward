import { timingSafeEqual } from 'node:crypto';

import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import { env } from '$env/dynamic/private';
import { logger as baseLogger } from '$lib/server/logger.js';

const API_KEY_HEADER = 'x-api-key';

export type Middleware = (handler: RequestHandler) => RequestHandler;

export function composeMiddleware(middlewares: Middleware[]) {
  return (handler: RequestHandler) =>
    middlewares.reduceRight((currentHandler, middleware) => middleware(currentHandler), handler);
}

function getRequestLogger(event: Parameters<RequestHandler>[0], middleware: string) {
  return event.locals.logger?.child({ middleware }) ?? baseLogger.child({ middleware });
}

function getInternalApiKey() {
  return env.EXTRACT_API_KEY ?? '';
}

function isValidApiKey(apiKey: string, expectedApiKey: string) {
  if (apiKey.length !== expectedApiKey.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(apiKey), Buffer.from(expectedApiKey));
}

export function withInternalApiKey(handler: RequestHandler): RequestHandler {
  return async (event) => {
    const logger = getRequestLogger(event, 'withInternalApiKey');
    const expectedApiKey = getInternalApiKey();

    if (!expectedApiKey) {
      logger.error('EXTRACT_API_KEY is not configured');
      return json({ message: 'Internal API key is not configured.' }, { status: 500 });
    }

    const apiKey = event.request.headers.get(API_KEY_HEADER);
    if (!apiKey || !isValidApiKey(apiKey, expectedApiKey)) {
      logger.warn(
        { method: event.request.method, path: event.url.pathname },
        'Internal API request rejected: invalid or missing API key',
      );
      return json({ message: 'Unauthorized' }, { status: 401 });
    }

    return handler(event);
  };
}

export function withIpWhitelist(handler: RequestHandler): RequestHandler {
  return async (event) => {
    const logger = getRequestLogger(event, 'withIpWhitelist');
    const allowedIps = (env.EXTRACT_API_ALLOWED_IPS ?? '')
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean);

    if (allowedIps.length === 0) {
      logger.error('EXTRACT_API_ALLOWED_IPS is not configured');
      return json({ message: 'IP whitelist is not configured.' }, { status: 500 });
    }

    const clientIp = event.getClientAddress();
    if (!allowedIps.includes(clientIp)) {
      logger.warn(
        { clientIp, method: event.request.method, path: event.url.pathname },
        'Internal API request rejected: IP not in whitelist',
      );
      return json({ message: 'Forbidden' }, { status: 403 });
    }

    return handler(event);
  };
}
