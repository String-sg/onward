import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

const colorMapping: Record<string, string> = {
  'Special Educational Needs': 'purple',
  'Artificial Intelligence': 'amber',
  'Teacher mental health literacy': 'teal',
  Podcast: 'slate',
};

const typeMapping: Record<string, string> = {
  'Artificial Intelligence': 'AI',
  'Special Educational Needs': 'SEN',
  'Teacher mental health literacy': 'MENTAL_HEALTH',
};

export const load: PageServerLoad = async () => {
  const learningUnits = await db.learningUnit.findMany({
    select: {
      id: true,
      tags: true,
      title: true,
      summary: true,
      contentURL: true,
      createdAt: true,
      createdBy: true,
    },
    take: 3,
  });

  const collections = await db.collection.findMany({
    select: {
      id: true,
      tag: true,
      title: true,
    },
    take: 3,
  });

  if (!learningUnits || !collections) {
    throw error(404);
  }

  return {
    learningUnits: learningUnits.map((unit) => {
      return {
        ...unit,
        tags: unit.tags.map((tag) => ({ variant: colorMapping[tag], content: tag })),
      };
    }),
    collections: await Promise.all(
      collections.map(async (collection) => {
        return {
          ...collection,
          type: typeMapping[collection.tag],
          numberOfPodcasts: await db.learningUnit.count({
            where: {
              collectionId: collection.id,
            },
          }),
        };
      }),
    ),
  };
};
