import { redirect } from '@sveltejs/kit';

import { type CollectionModel, db, type TagModel } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_learning' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    throw redirect(303, '/login');
  }

  interface CollectionWithTags extends Pick<CollectionModel, 'id' | 'title' | 'type'> {
    numberOfPodcasts: number;
    tags: Pick<TagModel, 'code' | 'label'>[];
  }

  const collections = await db.$queryRaw<CollectionWithTags[]>`
    SELECT
      c.id AS id,
      c.title AS title,
      c.type AS type,
      COUNT(DISTINCT lj.id) AS "numberOfPodcasts"
    FROM learning_journeys lj
    INNER JOIN learning_units lu ON lu.id = lj.learning_unit_id
    INNER JOIN collections c ON c.id = lu.collection_id
    WHERE lj.user_id = ${user.id}
    GROUP BY c.id
    ORDER BY MAX(lj.updated_at) DESC;
  `;

  const collection = collections.map((collection) => ({
    ...collection,
    numberOfPodcasts: Number(collection.numberOfPodcasts),
  }));

  return {
    collections: collection,
    username: user.name,
  };
};
