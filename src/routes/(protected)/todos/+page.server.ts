import { error, redirect } from '@sveltejs/kit';

import { getLearningUnitStatus } from '$lib/helpers/index.js';
import { db, type LearningUnitFindManyArgs, type LearningUnitGetPayload } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_todos' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    throw redirect(303, '/login');
  }

  const learningUnitsArgs = {
    select: {
      id: true,
      createdAt: true,
      title: true,
      summary: true,
      contentURL: true,
      createdBy: true,
      isRequired: true,
      dueDate: true,
      collection: {
        select: {
          type: true,
        },
      },
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
    where: {
      isRequired: true,
      OR: [
        {
          learningJourneys: {
            some: {
              userId: user.id,
              isCompleted: false,
            },
          },
        },
        {
          NOT: {
            learningJourneys: {
              some: {
                userId: user.id,
              },
            },
          },
        },
      ],
    },
    orderBy: [
      {
        dueDate: 'asc',
      },
    ],
  } satisfies LearningUnitFindManyArgs;

  let learningUnits: LearningUnitGetPayload<typeof learningUnitsArgs>[];
  try {
    learningUnits = await db.learningUnit.findMany(learningUnitsArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve To-do Learning Units');
    throw error(500);
  }

  return {
    learningUnits: learningUnits.map((lu) => ({
      ...lu,
      status: getLearningUnitStatus({
        isRequired: lu.isRequired,
        dueDate: lu.dueDate,
        learningJourney: lu.learningJourneys[0],
      }),
      tags: lu.tags.map((t) => t.tag),
      collectionType: lu.collection.type,
    })),
  };
};
