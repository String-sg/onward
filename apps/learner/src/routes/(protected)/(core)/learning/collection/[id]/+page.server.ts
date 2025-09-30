import { error, redirect } from '@sveltejs/kit';

import { db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_learning_collection' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    throw redirect(303, '/login');
  }

  const collection = await db.collection.findUnique({
    where: { id: BigInt(event.params.id) },
    select: {
      title: true,
    },
  });

  if (!collection) {
    throw error(404);
  }

  const learningJourneys = await db.learningJourney.findMany({
    select: {
      id: true,
      isCompleted: true,
      createdAt: true,
      learningUnit: {
        select: {
          title: true,
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
      },
    },
    where: {
      userId: BigInt(user.id),
      learningUnit: {
        collectionId: BigInt(event.params.id),
      },
    },
  });

  const mappedJourneys = learningJourneys.map((journey) => ({
    id: journey.id,
    title: journey.learningUnit.title,
    isCompleted: journey.isCompleted,
    createdAt: journey.createdAt,
    createdBy: journey.learningUnit.createdBy,
    tags: journey.learningUnit.tags.map((t) => ({
      code: t.tag.code,
      label: t.tag.label,
    })),
  }));

  const inProgress = mappedJourneys.filter((journey) => !journey.isCompleted);
  const completed = mappedJourneys.filter((journey) => journey.isCompleted);

  return {
    title: collection.title,
    journeys: {
      inProgress,
      completed,
    },
  };
};
