import { redirect } from '@sveltejs/kit';

import { getLearningUnitStatus } from '$lib/helpers/index.js';
import { db, LearningUnitStatus } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_bites' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    throw redirect(303, '/login');
  }

  const learningUnits = await db.learningUnit.findMany({
    where: {
      status: LearningUnitStatus.PUBLISHED,
    },
    select: {
      id: true,
      createdAt: true,
      title: true,
      objectives: true,
      contentURL: true,
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
        select: {
          isCompleted: true,
        },
        where: {
          userId: user.id,
        },
      },
    },
    orderBy: [
      {
        isRecommended: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
  });

  return {
    learningUnits: learningUnits.map((unit) => ({
      ...unit,
      tags: unit.tags.map((t) => t.tag),
      status: getLearningUnitStatus({
        isRequired: unit.isRequired,
        dueDate: unit.dueDate,
        learningJourney: unit.learningJourneys[0],
      }),
    })),
  };
};
