import { ContentType, db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const collections = await db.collection.findMany({
    select: {
      id: true,
      title: true,
      type: true,
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
      _count: {
        select: {
          learningUnit: {
            where: {
              contentType: ContentType.PODCAST,
            },
          },
        },
      },
    },
  });

  return {
    collections: collections.map((collection) => ({
      ...collection,
      tags: collection.tags.map((t) => t.tag),
      numberOfPodcasts: collection._count.learningUnit,
    })),
  };
};
