import { json } from '@sveltejs/kit';

import { db, type UserProfileCreateArgs } from '$lib/server/db';

import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({
    handler: 'api_update_onboarding',
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
      !('topics' in params) ||
      !Array.isArray(params['topics']) ||
      params['topics'].length < 3 ||
      !('frequency' in params) ||
      typeof params['frequency'] !== 'string' ||
      !('csrfToken' in params) ||
      typeof params['csrfToken'] !== 'string'
    ) {
      return json(null, { status: 422 });
    }
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to parse request body');
    return json(null, { status: 400 });
  }

  const { topics, frequency } = params;

  try {
    const collections = await db.collection.findMany({
      where: {
        type: {
          in: topics,
        },
      },
      select: {
        id: true,
      },
    });

    if (collections.length === 0) {
      logger.warn({ topics }, 'No valid collections found');
      return json(null, { status: 400 });
    }

    const userProfileArgs = {
      data: {
        userId: user.id,
        learningFrequency: frequency,
        interests: {
          create: collections.map((collection) => ({
            collectionId: collection.id,
          })),
        },
      },
    } satisfies UserProfileCreateArgs;

    await db.userProfile.create(userProfileArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to complete onboarding');
    return json(null, { status: 500 });
  }

  return json(null, { status: 200 });
};
