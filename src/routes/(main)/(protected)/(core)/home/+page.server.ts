import { error, redirect } from '@sveltejs/kit';

import { getLearningUnitStatus } from '$lib/helpers/index.js';
import {
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

  interface CollectionRow {
    id: string;
    title: string;
    number_of_bites: bigint;
    min_due_date: Date | null;
  }

  let collections: CollectionRow[];

  try {
    collections = await db.$queryRaw<CollectionRow[]>`
      WITH collection_data AS (
        SELECT
          c.id,
          c.title,
          COUNT(lu.id) FILTER (WHERE lu.status = 'PUBLISHED') AS number_of_bites,
          MIN(lu.due_date) FILTER (
            WHERE lu.status = 'PUBLISHED' AND lu.is_required = true AND lu.due_date IS NOT NULL
          ) AS min_due_date,
          MAX(lu.updated_at) FILTER (WHERE lu.status = 'PUBLISHED') AS max_content_updated_at
        FROM collections c
        INNER JOIN learning_unit_collections luc ON luc.collection_id = c.id
        INNER JOIN learning_units lu ON lu.id = luc.learning_unit_id
        WHERE c.is_topic = false
        GROUP BY c.id, c.title
        HAVING COUNT(lu.id) FILTER (WHERE lu.status = 'PUBLISHED') > 0
      )
      SELECT id, title, number_of_bites, min_due_date
      FROM collection_data
      ORDER BY min_due_date ASC NULLS LAST, max_content_updated_at DESC
      LIMIT 4
    `;
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve collections');
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

  return {
    username: user.name,
    collections: collections.map((row) => ({
      id: row.id,
      title: row.title,
      numberOfBites: Number(row.number_of_bites),
      dueDate: row.min_due_date
        ? row.min_due_date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : null,
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
      numberOfBites: collection._count.learningUnits,
    })),
  };
};
