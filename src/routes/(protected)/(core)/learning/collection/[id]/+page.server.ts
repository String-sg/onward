import { error, redirect } from '@sveltejs/kit';

import {
  db,
  type LearningJourneyModel,
  type LearningUnitModel,
  type TagModel,
} from '$lib/server/db';

import type { PageServerLoad } from './$types';

interface Result {
  id: LearningJourneyModel['id'];
  isCompleted: LearningJourneyModel['isCompleted'];
  unitId: LearningUnitModel['id'];
  title: LearningUnitModel['title'];
  createdAt: LearningUnitModel['createdAt'];
  createdBy: LearningUnitModel['createdBy'];
  tags: Pick<TagModel, 'code' | 'label'>[];
}

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_learning_collection' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    throw redirect(303, '/login');
  }

  const collection = await db.collection.findUnique({
    where: { id: BigInt(event.params.id) },
    select: {
      title: true,
      description: true,
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
          title: true,
          createdAt: true,
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
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return {
    title: collection.title,
    description: collection.description,
    journeys: learningJourneys.reduce<{
      inProgress: Result[];
      isCompleted: Result[];
    }>(
      (acc, journey) => {
        acc[journey.isCompleted ? 'isCompleted' : 'inProgress'].push({
          id: journey.id,
          isCompleted: journey.isCompleted,
          unitId: journey.learningUnit.id,
          title: journey.learningUnit.title,
          createdAt: journey.learningUnit.createdAt,
          createdBy: journey.learningUnit.createdBy,
          tags: journey.learningUnit.tags.map((t) => ({
            code: t.tag.code,
            label: t.tag.label,
          })),
        });

        return acc;
      },
      { inProgress: [], isCompleted: [] },
    ),
  };
};
