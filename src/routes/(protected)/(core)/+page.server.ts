import { error, redirect } from '@sveltejs/kit';

import {
  db,
  type LearningJourneyFindManyArgs,
  type LearningJourneyGetPayload,
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
      userId: BigInt(user.id),
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

  return {
    learningJourneys,
    username: user.name,
  };
};
