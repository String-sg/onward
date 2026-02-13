import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { nanoid } from '$lib/helpers/index.js';
import { adminAuth } from '$lib/server/auth/index.js';
import { logger } from '$lib/server/logger.js';

/**
 * A handle that adds a request ID to the response headers and attaches a scoped logger to the
 * event. Downstream handles are expected to use the scoped logger for logging.
 */
const requestLoggingHandle: Handle = async ({ event, resolve }) => {
  const requestId = nanoid();

  event.setHeaders({ 'X-Request-Id': requestId });
  event.locals.logger = logger.child({ requestId, module: 'admin' });

  return await resolve(event);
};

/**
 * A handle that enforces authentication on admin routes.
 * - Requests for google auth (`/admin/auth/google/*`) are always allowed through.
 * - Unauthenticated users are redirected to `/admin/auth/google?return_to=%2Fadmin`.
 * - Authenticated users who are not 'admin' are redirected to `/admin/auth/google?return_to=%2Fadmin`.
 */
const routeProtectionHandle: Handle = async ({ event, resolve }) => {
  if (!event.url.pathname.startsWith('/admin')) {
    return redirect(303, '/admin/auth/google?return_to=%2Fadmin');
  }

  if (
    event.url.pathname === '/admin/auth/google' ||
    event.url.pathname === '/admin/auth/google/callback' ||
    event.url.pathname === '/admin'
  ) {
    return await resolve(event);
  }

  if (!event.locals.session.isAuthenticated) {
    return redirect(303, `/admin/auth/google?return_to=${encodeURIComponent(event.url.pathname)}`);
  }

  if (!event.locals.session.user) {
    return redirect(303, '/admin/auth/google?return_to=%2Fadmin');
  }

  const user = event.locals.session.user;
  if ('isActive' in user && user.isActive === false) {
    event.locals.logger.warn(
      { email: user.email },
      'Inactive admin attempted to access protected route',
    );
    await adminAuth.signOut(event);
    return redirect(303, '/admin?error=inactive');
  }

  return await resolve(event);
};

export const handle: Handle = sequence(
  requestLoggingHandle,
  adminAuth.handle,
  routeProtectionHandle,
);
