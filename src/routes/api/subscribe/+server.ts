import { json } from '@sveltejs/kit';

import { db } from '$lib/server/db';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({
    handler: 'api_update_subscribe',
  });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return json(null, { status: 401 });
  }

  if (event.request.headers.get('content-type')?.split(';')[0] !== 'application/json') {
    return json(null, { status: 415 });
  }

  let params;
  try {
    params = await event.request.json();
    if (
      !params ||
      typeof params !== 'object' ||
      !('isSubscribed' in params) ||
      typeof params['isSubscribed'] !== 'boolean' ||
      !('csrfToken' in params) ||
      typeof params['csrfToken'] !== 'string'
    ) {
      return json(null, { status: 422 });
    }
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to parse request body');
    return json(null, { status: 400 });
  }

  const { isSubscribed } = params;

  try {
    await db.user.update({
      data: {
        isSubscribed,
      },
      where: { id: user.id },
    });
  } catch (err) {
    logger.error({ err }, "Failed to update user's subscription");
    return json(null, { status: 500 });
  }

  return json(null, { status: 200 });
};
