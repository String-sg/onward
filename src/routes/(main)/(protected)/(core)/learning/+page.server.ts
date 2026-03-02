import { redirect } from '@sveltejs/kit';

import { getLearningUnitStatus } from '$lib/helpers';
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
  status: 'COMPLETED' | 'OVERDUE' | 'REQUIRED' | null;
}

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_learning' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    throw redirect(303, '/login');
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
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return {
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
          status: getLearningUnitStatus({
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
    username: user.name,
  };
};
