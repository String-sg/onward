import { error, redirect } from '@sveltejs/kit';

import {
  type CollectionFindManyArgs,
  type CollectionGetPayload,
  db,
  LearningUnitStatus,
} from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_collections' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    throw redirect(303, '/login');
  }

  const collectionArgs = {
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          learningUnits: {
            where: {
              learningUnit: {
                status: LearningUnitStatus.PUBLISHED,
              },
            },
          },
        },
      },
    },
    where: {
      isTopic: false,
      learningUnits: {
        some: {
          learningUnit: {
            status: LearningUnitStatus.PUBLISHED,
          },
        },
      },
    },
    orderBy: [{ createdAt: 'desc' as const }],
  } satisfies CollectionFindManyArgs;

  let collections: CollectionGetPayload<typeof collectionArgs>[];
  try {
    collections = await db.collection.findMany(collectionArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve collections');
    throw error(500);
  }

  return {
    collections: collections.map((collection) => ({
      ...collection,
      numberOfBites: collection._count.learningUnits,
    })),
  };
};
