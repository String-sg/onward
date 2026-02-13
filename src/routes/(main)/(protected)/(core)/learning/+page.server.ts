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

  interface CollectionWithTags extends Pick<CollectionModel, 'id' | 'title'> {
    numberOfPodcasts: number;
    tagCode: string;
    tags: Pick<TagModel, 'code' | 'label'>[];
  }

  const collections = await db.$queryRaw<CollectionWithTags[]>`
    SELECT
      c.id AS id,
      c.title AS title,
      t.code AS "tagCode",
      COUNT(DISTINCT lj.id) AS "numberOfPodcasts"
    FROM learning_journeys lj
           INNER JOIN learning_units lu ON lu.id = lj.learning_unit_id
           INNER JOIN learning_unit_collections luc ON luc.learning_unit_id = lu.id
           INNER JOIN collections c ON c.id = luc.collection_id
           INNER JOIN tags t ON t.id = c.tag_id
    WHERE lj.user_id = ${user.id}
    GROUP BY c.id, t.code
    ORDER BY MAX(lj.updated_at) DESC;
  `;

  return {
    collections,
    username: user.name,
  };
};
