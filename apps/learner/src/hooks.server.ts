import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { nanoid } from '$lib/helpers/index.js';
import { auth } from '$lib/server/auth.js';
import { logger } from '$lib/server/logger.js';

/**
 * A handle that adds a request ID for tracing and attaches a scoped logger to the event.
 */
const requestLoggingHandle: Handle = async ({ event, resolve }) => {
  const requestId = nanoid();

  event.locals.logger = logger.child({ requestId });
  event.setHeaders({ 'X-Request-Id': requestId });

  return await resolve(event);
};

/**
 * A handle that protects routes that requires authentication.
 *
 * For unauthenticated users:
 * - Redirects root path `/` to `/login`
 * - Redirects protected routes to `/login`
 *
 * For authenticated users:
 * - Redirects `/login` to root path `/`
 */
const authenticationHandle: Handle = async ({ event, resolve }) => {
  if (!event.locals.session.isAuthenticated) {
    if (event.url.pathname === '/') {
      return redirect(303, '/login');
    }

    if (
      event.url.pathname !== '/login' &&
      event.url.pathname !== '/auth/google' &&
      event.url.pathname !== '/auth/google/callback'
    ) {
      return redirect(303, `/login?return_to=${encodeURIComponent(event.url.pathname)}`);
    }

    return await resolve(event);
  }

  if (event.url.pathname === '/login') {
    return redirect(302, '/');
  }

  return await resolve(event);
};

export const handle: Handle = sequence(auth.handle, requestLoggingHandle, authenticationHandle);
