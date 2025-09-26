import { redirect } from '@sveltejs/kit';

import { type CollectionType, db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'user_profile' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User is not authenticated');
    throw redirect(303, '/login');
  }

  const userId = user.id;

  const collections = await db.$queryRaw<
    { id: bigint; numberOfPodcasts: number; title: string; type: CollectionType }[]
  >`
    SELECT
      collections.title AS title,
      collections.type as type,
      collections.id AS id,
      COUNT(learning_journeys.id) AS "numberOfPodcasts"
    FROM learning_journeys
    INNER JOIN learning_units ON learning_unit_id = learning_units.id
    INNER JOIN collections ON learning_units.collection_id = collections.id
    WHERE learning_journeys.user_id = ${userId}
    GROUP BY collections.id
  `;

  const collectionTags = await db.collection.findMany({
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
    },
    where: {
      id: {
        in: collections.map((c) => c.id),
      },
    },
  });

  return {
    collections: collections.map((collection) => ({
      ...collection,
      tags:
        collectionTags
          .find((collectionTag) => collection.id === collectionTag.id)
          ?.tags.map((t) => t.tag) || [],
    })),
  };
};
