import { json } from '@sveltejs/kit';

import { db, type LearningJourneyUpsertArgs } from '$lib/server/db.js';

import type { RequestHandler } from './$types';

type JSONPrimitive = string | number | boolean | null;
type JSONValue = JSONPrimitive | JSONValue[] | JSONObject;
type JSONObject = { [key in string]: JSONValue };

export const POST: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_create_update_learning_journey' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return json(null, { status: 401 });
  }

  if (event.request.headers.get('content-type')?.split(';')[0] !== 'application/json') {
    return json(null, { status: 415 });
  }

  let params: JSONObject;
  try {
    params = await event.request.json();
    if (
      !params ||
      typeof params !== 'object' ||
      !('id' in params) ||
      typeof params['id'] !== 'number' ||
      !('lastCheckpoint' in params) ||
      typeof params['lastCheckpoint'] !== 'number'
    ) {
      return json(null, { status: 422 });
    }
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to parse request body');
    return json(null, { status: 400 });
  }

  const learningJourneyArgs = {
    update: {
      lastCheckpoint: params.lastCheckpoint,
    },
    where: {
      userId_learningUnitId: { userId: BigInt(user.id), learningUnitId: BigInt(params.id) },
    },
    create: {
      userId: BigInt(user.id),
      learningUnitId: BigInt(params.id),
      isCompleted: false,
      lastCheckpoint: params.lastCheckpoint,
    },
  } satisfies LearningJourneyUpsertArgs;

  try {
    await db.learningJourney.upsert(learningJourneyArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to create/update learning journey');
    return json(null, { status: 500 });
  }

  return json({
    success: true,
  });
};
