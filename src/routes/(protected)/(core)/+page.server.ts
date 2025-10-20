import { error, redirect } from '@sveltejs/kit';

import {
  db,
  type LearningJourneyFindManyArgs,
  type LearningJourneyGetPayload,
  type LearningUnitFindManyArgs,
  type LearningUnitGetPayload,
} from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_home' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    throw redirect(303, '/login');
  }

  const learningJourneyArgs = {
    select: {
      id: true,
      learningUnit: {
        select: {
          id: true,
          title: true,
          summary: true,
          contentURL: true,
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
      userId: user.id,
      isCompleted: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
  } satisfies LearningJourneyFindManyArgs;

  let learningJourneys: LearningJourneyGetPayload<typeof learningJourneyArgs>[];
  try {
    learningJourneys = await db.learningJourney.findMany(learningJourneyArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve learning journeys');
    throw error(500);
  }

  const recommendedLearningUnitsArgs = {
    select: {
      id: true,
      title: true,
      summary: true,
      contentURL: true,
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
    where: {
      isRecommended: true,
      NOT: {
        learningJourneys: {
          some: {
            userId: user.id,
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
  } satisfies LearningUnitFindManyArgs;

  let recommendedLearningUnits: LearningUnitGetPayload<typeof recommendedLearningUnitsArgs>[];
  try {
    recommendedLearningUnits = await db.learningUnit.findMany(recommendedLearningUnitsArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve recommended learning units');
    throw error(500);
  }

  return {
    learningJourneys: learningJourneys.map((lj) => ({
      ...lj,
      learningUnit: {
        ...lj.learningUnit,
        tags: lj.learningUnit.tags.map((t) => t.tag),
      },
    })),
    recommendedLearningUnits: recommendedLearningUnits.map((lu) => ({
      ...lu,
      tags: lu.tags.map((t) => t.tag),
    })),
    username: user.name,
  };
};
