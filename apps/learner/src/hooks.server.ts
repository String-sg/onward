import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { nanoid } from '$lib/helpers/index.js';
import { auth } from '$lib/server/auth.js';
import { logger } from '$lib/server/logger.js';

export const handle: Handle = sequence(auth.handle, async ({ event, resolve }) => {
  const requestId = nanoid();

  event.locals.logger = logger.child({ requestId });
  event.setHeaders({ 'X-Request-Id': requestId });

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
});
