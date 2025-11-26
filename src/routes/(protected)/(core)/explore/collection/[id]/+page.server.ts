import { error, redirect } from '@sveltejs/kit';
import { validate as uuidValidate } from 'uuid';

import { getLearningUnitStatus } from '$lib/helpers/index.js';
import {
  type CollectionFindUniqueArgs,
  type CollectionGetPayload,
  db,
  type LearningUnitFindManyArgs,
  type LearningUnitGetPayload,
} from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_explore_collection' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return redirect(303, '/login');
  }

  if (!uuidValidate(event.params.id)) {
    throw error(404);
  }

  const collectionArgs = {
    select: {
      title: true,
      description: true,
      type: true,
    },
    where: { id: event.params.id },
  } satisfies CollectionFindUniqueArgs;

  let collection: CollectionGetPayload<typeof collectionArgs> | null;
  try {
    collection = await db.collection.findUnique(collectionArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve collection records');
    throw error(500);
  }

  if (!collection) {
    logger.error('Collection not found');
    throw error(404);
  }

  const learningUnitsArgs = {
    select: {
      id: true,
      createdAt: true,
      title: true,
      objectives: true,
      contentURL: true,
      createdBy: true,
      isRequired: true,
      dueDate: true,
      tags: {
        select: {
          tag: {
            select: {
              code: true,
              label: true,
            },
          },
        },
      },
      learningJourneys: {
        select: {
          isCompleted: true,
        },
        where: {
          userId: user.id,
        },
      },
    },
    where: { collectionId: event.params.id },
    orderBy: {
      createdAt: 'desc',
    },
  } satisfies LearningUnitFindManyArgs;

  let learningUnits: LearningUnitGetPayload<typeof learningUnitsArgs>[];
  try {
    learningUnits = await db.learningUnit.findMany(learningUnitsArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve learning unit records');
    throw error(500);
  }

  return {
    collection,
    learningUnits: learningUnits.map((unit) => ({
      ...unit,
      tags: unit.tags.map((t) => t.tag),
      status: getLearningUnitStatus({
        isRequired: unit.isRequired,
        dueDate: unit.dueDate,
        learningJourney: unit.learningJourneys[0],
      }),
    })),
  };
};
