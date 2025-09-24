import { error, redirect } from '@sveltejs/kit';

import { db } from '$lib/server/db';

import type { Collection, LearningUnit, Tag } from '../../../../../../generated/prisma/client.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'explore_collection' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User is not authenticated');
    return redirect(303, '/login');
  }

  let collection: Pick<Collection, 'title' | 'description'> | null;
  let learningUnits: (Pick<
    LearningUnit,
    'id' | 'title' | 'summary' | 'contentURL' | 'createdAt' | 'createdBy'
  > & {
    tags: {
      tag: Pick<Tag, 'code' | 'label'>;
    }[];
  })[];

  try {
    [collection, learningUnits] = await Promise.all([
      db.collection.findUnique({
        select: {
          title: true,
          description: true,
        },
        where: { id: BigInt(event.params.id) },
      }),
      db.learningUnit.findMany({
        select: {
          id: true,
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
          title: true,
          summary: true,
          contentURL: true,
          createdAt: true,
          createdBy: true,
        },
        where: { collectionId: BigInt(event.params.id) },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);
  } catch (err) {
    logger.error(
      { err },
      'Unknown error occurred while retrieving collection/learning unit records',
    );
    throw error(500);
  }

  if (!collection) {
    logger.error('Collection not found');
    throw error(404);
  }

  return {
    title: collection.title,
    description: collection.description,
    learningUnits: learningUnits.map((unit) => ({
      ...unit,
      tags: unit.tags.map((t) => t.tag),
    })),
  };
};
