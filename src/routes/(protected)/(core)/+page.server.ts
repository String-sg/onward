import { error, redirect } from '@sveltejs/kit';

import { getLearningUnitStatus } from '$lib/helpers/index.js';
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

  const toDoListArgs = {
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
    take: 10, // To-do: Limit to 2 items
  } satisfies LearningUnitFindManyArgs;

  let toDoList: LearningUnitGetPayload<typeof toDoListArgs>[];
  try {
    toDoList = await db.learningUnit.findMany(toDoListArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve to-do list');
    throw error(500);
  }

  const recommendedLearningUnitsArgs = {
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
    },
    where: {
      isRequired: false,
      NOT: {
        learningJourneys: {
          some: {
            userId: user.id,
          },
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
    take: 3,
  } satisfies LearningUnitFindManyArgs;

  let recommendedLearningUnits: LearningUnitGetPayload<typeof recommendedLearningUnitsArgs>[];
  try {
    recommendedLearningUnits = await db.learningUnit.findMany(recommendedLearningUnitsArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve recommended learning units');
    throw error(500);
  }

  const learningJourneyArgs = {
    select: {
      id: true,
      isCompleted: true,
      isQuizPassed: true,
      learningUnit: {
        select: {
          id: true,
          title: true,
          summary: true,
          contentURL: true,
          createdAt: true,
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
          collection: {
            select: {
              type: true,
            },
          },
        },
      },
    },
    where: {
      userId: user.id,
      isCompleted: true,
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

  const collections = await db.collection.findMany({
    select: {
      id: true,
      title: true,
      type: true,
      _count: {
        select: {
          learningUnit: true,
        },
      },
    },
  });

  return {
    username: user.name,
    toDoList: toDoList.map((lu) => ({
      ...lu,
      status: getLearningUnitStatus({
        isRequired: lu.isRequired,
        dueDate: lu.dueDate,
        learningJourney: lu.learningJourneys[0],
      }),
      tags: lu.tags.map((t) => t.tag),
      collectionType: lu.collection.type,
    })),
    recommendedLearningUnits: recommendedLearningUnits.map((lu) => ({
      ...lu,
      status: null,
      tags: lu.tags.map((t) => t.tag),
      collectionType: lu.collection.type,
    })),
    learningJourneys: learningJourneys.map((lj) => ({
      ...lj,
      learningUnit: {
        ...lj.learningUnit,
        tags: lj.learningUnit.tags.map((t) => t.tag),
        collectionType: lj.learningUnit.collection.type,
        status: getLearningUnitStatus({
          isRequired: lj.learningUnit.isRequired,
          dueDate: lj.learningUnit.dueDate,
          learningJourney: {
            isCompleted: lj.isCompleted,
          },
        }),
      },
    })),
    collections: collections.map((collection) => ({
      ...collection,
      numberOfPodcasts: collection._count.learningUnit,
    })),
  };
};
