import { error, redirect } from '@sveltejs/kit';

import { getLearningUnitStatus } from '$lib/helpers/index.js';
import {
  type CollectionFindManyArgs,
  type CollectionGetPayload,
  db,
  type LearningJourneyFindManyArgs,
  type LearningJourneyGetPayload,
  type LearningUnitFindManyArgs,
  type LearningUnitGetPayload,
  LearningUnitStatus,
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
      title: true,
      _count: {
        select: {
          learningUnits: true,
        },
      },
      learningUnits: {
        select: {
          learningUnit: {
            select: {
              dueDate: true,
            },
          },
        },
      },
    },
    where: {
      learningUnits: {
        every: {
          learningUnit: {
            isRequired: true,
            status: LearningUnitStatus.PUBLISHED,
          },
        },
        some: {
          learningUnit: {
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
        },
      },
    },
  } satisfies CollectionFindManyArgs;

  let toDoList: CollectionGetPayload<typeof toDoListArgs>[];
  try {
    toDoList = await db.collection.findMany(toDoListArgs);
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
      contents: {
        select: { id: true, type: true, url: true },
        where: { type: 'PODCAST' },
        take: 1,
      },
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
    where: {
      status: LearningUnitStatus.PUBLISHED,
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
      checkpoints: {
        select: { lastCheckpoint: true },
        where: { learningUnitContent: { type: 'PODCAST' } },
        take: 1,
      },
      learningUnit: {
        select: {
          id: true,
          title: true,
          summary: true,
          contents: {
            select: { id: true, type: true, url: true },
            where: { type: 'PODCAST' },
            take: 1,
          },
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
        },
      },
    },
    where: {
      userId: user.id,
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

  const topicalCollections = await db.collection.findMany({
    select: {
      id: true,
      title: true,
      tag: {
        select: {
          code: true,
        },
      },
      _count: {
        select: {
          learningUnits: {
            where: {
              learningUnit: {
                status: LearningUnitStatus.PUBLISHED,
              },
            },
          },
        },
      },
    },
    where: {
      isTopic: true,
    },
  });

  const collectionArgs = {
    select: {
      id: true,
      title: true,
      _count: {
        select: {
          learningUnits: {
            where: {
              learningUnit: {
                status: LearningUnitStatus.PUBLISHED,
              },
            },
          },
        },
      },
    },
    where: {
      isTopic: false,
      learningUnits: {
        some: {
          learningUnit: {
            status: LearningUnitStatus.PUBLISHED,
          },
        },
      },
      NOT: {
        title: 'AI Literacy',
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 2,
  } satisfies CollectionFindManyArgs;
  let collections: CollectionGetPayload<typeof collectionArgs>[];
  try {
    collections = await db.collection.findMany(collectionArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve Collections');
    throw error(500);
  }

  return {
    username: user.name,
    toDoList: toDoList.map((collection) => ({
      ...collection,
      numberOfPodcasts: collection._count.learningUnits,
      dueDate: new Date(
        Math.max(
          ...collection.learningUnits
            .map((lu) => lu.learningUnit.dueDate?.getTime() ?? 0)
            .filter((time) => time > 0),
        ),
      ).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    })),
    recommendedLearningUnits: recommendedLearningUnits.map((lu) => ({
      ...lu,
      status: getLearningUnitStatus({
        isRequired: lu.isRequired,
        dueDate: lu.dueDate,
        learningJourney: lu.learningJourneys[0],
      }),
      tags: lu.tags.map((t) => t.tag),
    })),
    learningJourneys: learningJourneys.map(({ checkpoints, ...lj }) => ({
      ...lj,
      lastCheckpoint: checkpoints[0] ? Number(checkpoints[0].lastCheckpoint) : 0,
      learningUnit: {
        ...lj.learningUnit,
        tags: lj.learningUnit.tags.map((t) => t.tag),
        status: getLearningUnitStatus({
          isRequired: lj.learningUnit.isRequired,
          dueDate: lj.learningUnit.dueDate,
          learningJourney: {
            isCompleted: lj.isCompleted,
          },
        }),
      },
    })),
    topics: topicalCollections.map((collection) => ({
      ...collection,
      numberOfPodcasts: collection._count.learningUnits,
    })),
    collections: collections.map((collection) => ({
      ...collection,
      numberOfBites: collection._count.learningUnits,
    })),
  };
};
