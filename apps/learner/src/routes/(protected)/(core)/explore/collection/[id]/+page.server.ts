import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const collection = await db.collection.findUnique({
    where: { id: BigInt(params.id) },
    select: {
      title: true,
      description: true,
    },
  });

  if (!collection) {
    throw error(404);
  }

  const learningUnits = await db.learningUnit.findMany({
    where: { collectionId: BigInt(params.id) },
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    collection,
    learningUnits: learningUnits.map((unit) => ({
      ...unit,
      tags: unit.tags.map((t) => t.tag),
    })),
  };
};
