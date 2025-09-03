import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

import { nanoid } from '$lib/helpers/index.js';
import { auth } from '$lib/server/auth.js';
import { logger } from '$lib/server/logger.js';

export const handle: Handle = sequence(auth.handle, async ({ event, resolve }) => {
  const requestId = nanoid();

  event.locals.logger = logger.child({ requestId });
  event.setHeaders({ 'X-Request-Id': requestId });

  return await resolve(event);
});
