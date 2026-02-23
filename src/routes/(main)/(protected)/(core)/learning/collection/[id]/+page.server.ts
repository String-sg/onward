import { error, redirect } from '@sveltejs/kit';
import { validate as uuidValidate } from 'uuid';

import { getLearningUnitStatus } from '$lib/helpers/index.js';
import { db, type PublishedLearningUnit } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_learning_collection' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    throw redirect(303, '/login');
  }

  if (!uuidValidate(event.params.id)) {
    throw error(404);
  }

  const collection = await db.collection.findUnique({
    where: { id: event.params.id },
    select: {
      title: true,
      description: true,
      type: true,
    },
  });

  if (!collection) {
    throw error(404);
  }

  const learningJourneys = await db.learningJourney.findMany({
    select: {
      id: true,
      isCompleted: true,
      learningUnit: {
        select: {
          id: true,
          createdAt: true,
          title: true,
          createdBy: true,
          isRequired: true,
          dueDate: true,
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
      userId: user.id,
      learningUnit: {
        collectionId: event.params.id,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  type LU = PublishedLearningUnit<(typeof learningJourneys)[number]['learningUnit']>;
  interface Result {
    id: LU['id'];
    isCompleted: boolean;
    unitId: LU['id'];
    title: LU['title'];
    createdAt: LU['createdAt'];
    createdBy: LU['createdBy'];
    tags: { code: string; label: string }[];
    status: ReturnType<typeof getLearningUnitStatus>;
  }

  return {
    collection,
    journeys: learningJourneys.reduce<{
      inProgress: Result[];
      isCompleted: Result[];
    }>(
      (acc, journey) => {
        const lu = journey.learningUnit as LU;
        acc[journey.isCompleted ? 'isCompleted' : 'inProgress'].push({
          id: journey.id,
          isCompleted: journey.isCompleted,
          unitId: lu.id,
          title: lu.title,
          createdAt: lu.createdAt,
          createdBy: lu.createdBy,
          tags: lu.tags.map((t) => ({
            code: t.tag.code,
            label: t.tag.label,
          })),
          status: getLearningUnitStatus({
            isRequired: lu.isRequired,
            dueDate: lu.dueDate,
            learningJourney: {
              isCompleted: journey.isCompleted,
            },
          }),
        });

        return acc;
      },
      { inProgress: [], isCompleted: [] },
    ),
  };
};
