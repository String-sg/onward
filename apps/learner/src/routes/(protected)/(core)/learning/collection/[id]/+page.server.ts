import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const collection = await db.collection.findUnique({
    where: { id: BigInt(params.id) },
    select: {
      title: true,
    },
  });

  if (!collection) {
    throw error(404);
  }

  const learningUnit = await db.learningUnit.findMany({
    where: { collectionId: BigInt(params.id) },
    select: {
      id: true,
      createdAt: true,
      title: true,
      summary: true,
      contentURL: true,
      createdBy: true,
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
  });

  return {
    collection,
    learningUnits: learningUnit.map((unit) => ({
      ...unit,
      tags: unit.tags.map((t) => t.tag),
    })),
  };
};
