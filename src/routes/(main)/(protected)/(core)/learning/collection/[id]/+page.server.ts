import { error, redirect } from '@sveltejs/kit';
import { validate as uuidValidate } from 'uuid';

import { getLearningUnitStatus } from '$lib/helpers/index.js';
import {
  type CollectionFindUniqueArgs,
  type CollectionGetPayload,
  db,
  type LearningJourneyFindManyArgs,
  type LearningJourneyGetPayload,
  type LearningJourneyModel,
  type LearningUnitModel,
  LearningUnitStatus,
  type TagModel,
} from '$lib/server/db';
import type { PublishedLearningUnit } from '$lib/server/unit/types';

import type { PageServerLoad } from './$types';

interface Result {
  id: LearningJourneyModel['id'];
  isCompleted: LearningJourneyModel['isCompleted'];
  unitId: LearningUnitModel['id'];
  title: NonNullable<LearningUnitModel['title']>;
  createdAt: LearningUnitModel['createdAt'];
  createdBy: NonNullable<LearningUnitModel['createdBy']>;
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

  const collectionArgs = {
    select: {
      title: true,
      description: true,
      type: true,
    },
    where: { id: event.params.id },
  } satisfies CollectionFindUniqueArgs;

  let collection: CollectionGetPayload<typeof collectionArgs>;
  try {
    collection = await db.collection.findUniqueOrThrow(collectionArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve collection records');
    throw error(404);
  }

  const learningJourneysArgs = {
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
        status: LearningUnitStatus.PUBLISHED,
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  } satisfies LearningJourneyFindManyArgs;

  let learningJourneys: LearningJourneyGetPayload<typeof learningJourneysArgs>[];
  try {
    learningJourneys = await db.learningJourney.findMany(learningJourneysArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve learning journeys');
    throw error(500);
  }

  return {
    collection,
    journeys: learningJourneys.reduce<{
      inProgress: Result[];
      isCompleted: Result[];
    }>(
      (acc, journey) => {
        const learningUnit = journey.learningUnit as PublishedLearningUnit<
          typeof learningJourneysArgs.select.learningUnit
        >;
        acc[journey.isCompleted ? 'isCompleted' : 'inProgress'].push({
          id: journey.id,
          isCompleted: journey.isCompleted,
          unitId: learningUnit.id,
          title: learningUnit.title,
          createdAt: learningUnit.createdAt,
          createdBy: learningUnit.createdBy,
          tags: learningUnit.tags.map((t) => ({
            code: t.tag.code,
            label: t.tag.label,
          })),
          status: getLearningUnitStatus({
            isRequired: learningUnit.isRequired,
            dueDate: learningUnit.dueDate,
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
