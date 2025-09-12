import { db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const learningUnits = await db.learningUnit.findMany({
    select: {
      id: true,
      title: true,
      summary: true,
      contentURL: true,
      createdAt: true,
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
    take: 4,
  });

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
          learningUnit: true,
        },
      },
    },
  });

  return {
    learningUnits: learningUnits.map((unit) => ({
      ...unit,
      tags: unit.tags.map((t) => t.tag),
    })),
    collections: collections.map((collection) => ({
      ...collection,
      tags: collection.tags.map((t) => t.tag),
      numberOfPodcasts: collection._count.learningUnit,
    })),
  };
};
