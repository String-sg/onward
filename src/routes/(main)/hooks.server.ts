import { type Handle, json, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { env } from '$env/dynamic/private';
import { HOME_PATH, nanoid } from '$lib/helpers/index.js';
import { learnerAuth } from '$lib/server/auth/index.js';
import {
  type CloudfrontSignedCookiesOutput,
  getCloudFrontSignedCookies,
} from '$lib/server/cloudfront.js';
import { logger } from '$lib/server/logger.js';

/**
 * A handle that adds a request ID to the response headers and attaches a scoped logger to the
 * event. Downstream handles are expected to use the scoped logger for logging.
 */
const requestLoggingHandle: Handle = ({ event, resolve }) => {
  const requestId = nanoid();

  event.setHeaders({ 'X-Request-Id': requestId });
  event.locals.logger = logger.child({ requestId });

  return resolve(event);
};

/**
 * A handle that gates API routes behind feature flags.
 * Returns 403 for disabled features before any further processing.
 */
const featureFlagHandle: Handle = ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api/messages') && env.FEATURE_AI_CHAT !== 'true') {
    return json(null, { status: 403 });
  }

  return resolve(event);
};

/**
 * A handle that enforces authentication on protected routes.
 * - Requests to `/api/*` are always allowed through
 * - Authenticated users visiting `/login` are redirected back to `/`
 * - Unauthenticated users are redirected to `/login`
 */
const routeProtectionHandle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api/')) {
    return await resolve(event);
  }

  if (event.locals.session.isAuthenticated) {
    if (event.url.pathname === '/login') {
      return redirect(302, HOME_PATH);
    }

    return await resolve(event);
  }

  if (
    event.url.pathname === '/login' ||
    event.url.pathname === '/auth/google' ||
    event.url.pathname === '/auth/google/callback' ||
    event.url.pathname === '/terms' ||
    event.url.pathname === '/privacy'
  ) {
    return await resolve(event);
  }

  return redirect(303, `/login?return_to=${encodeURIComponent(event.url.pathname)}`);
};

const cloudFrontCookieHandle: Handle = async ({ event, resolve }) => {
  if (event.locals.session.isAuthenticated) {
    const ttl = learnerAuth.authenticatedTimeout;

    let signedCookies: CloudfrontSignedCookiesOutput | null;
    try {
      signedCookies = getCloudFrontSignedCookies(ttl);
    } catch (err) {
      event.locals.logger.error({ err }, 'Failed to generate CloudFront signed cookies');
      return await resolve(event);
    }
    if (!signedCookies) {
      return await resolve(event);
    }

    for (const [name, value] of Object.entries(signedCookies)) {
      event.cookies.set(name, value, {
        path: '/',
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: ttl,
      });
    }
  }

  return await resolve(event);
};

export const handle: Handle = sequence(
  requestLoggingHandle,
  featureFlagHandle,
  learnerAuth.handle,
  routeProtectionHandle,
  cloudFrontCookieHandle,
);
