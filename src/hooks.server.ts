import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { HOME_PATH, nanoid } from '$lib/helpers/index.js';
import auth from '$lib/server/auth/index.js';
import { logger } from '$lib/server/logger.js';

/**
 * A handle that adds a request ID to the response headers and attaches a scoped logger to the
 * event. Downstream handles are expected to use the scoped logger for logging.
 */
const requestLoggingHandle: Handle = async ({ event, resolve }) => {
  const requestId = nanoid();

  event.setHeaders({ 'X-Request-Id': requestId });
  event.locals.logger = logger.child({ requestId });

  return await resolve(event);
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

export const handle: Handle = sequence(requestLoggingHandle, auth.handle, routeProtectionHandle);
