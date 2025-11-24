import { error, redirect } from '@sveltejs/kit';
import { validate as uuidValidate } from 'uuid';

import {
  db,
  type LearningJourneyModel,
  type LearningUnitModel,
  type TagModel,
} from '$lib/server/db';
import { getStatus } from '$lib/server/learning-unit';

import type { PageServerLoad } from './$types';

interface Result {
  id: LearningJourneyModel['id'];
  isCompleted: LearningJourneyModel['isCompleted'];
  unitId: LearningUnitModel['id'];
  title: LearningUnitModel['title'];
  createdAt: LearningUnitModel['createdAt'];
  createdBy: LearningUnitModel['createdBy'];
  tags: Pick<TagModel, 'code' | 'label'>[];
  status: 'COMPLETED' | 'OVERDUE' | 'REQUIRED' | null;
}

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
          learningJourneys: {
            where: {
              userId: user.id,
            },
            select: {
              isCompleted: true,
            },
            take: 1,
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

  return {
    collection,
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
          status: getStatus({
            isRequired: journey.learningUnit.isRequired,
            dueDate: journey.learningUnit.dueDate,
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
