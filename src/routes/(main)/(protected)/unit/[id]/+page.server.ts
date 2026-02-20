import { error, redirect } from '@sveltejs/kit';
import { validate as uuidValidate } from 'uuid';

import { getLearningUnitStatus } from '$lib/helpers/index.js';
import { learnerAuth } from '$lib/server/auth';
import {
  db,
  type GetLearningUnitSentimentsAggregateType,
  type LearningJourneyFindUniqueArgs,
  type LearningJourneyGetPayload,
  type LearningJourneyUpsertArgs,
  type LearningUnitFindUniqueArgs,
  type LearningUnitGetPayload,
  type LearningUnitSentimentsAggregateArgs,
  type LearningUnitSentimentsDeleteArgs,
  type LearningUnitSentimentsFindUniqueArgs,
  type LearningUnitSentimentsGetPayload,
  type LearningUnitSentimentsUpsertArgs,
  type LearningUnitSourcesFindManyArgs,
  type LearningUnitSourcesGetPayload,
} from '$lib/server/db';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_learning_unit' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return redirect(303, '/login');
  }

  if (!uuidValidate(event.params.id)) {
    throw error(404);
  }

  const learningUnitArgs = {
    select: {
      id: true,
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
      title: true,
      summary: true,
      objectives: true,
      contentURL: true,
      contentType: true,
      createdAt: true,
      createdBy: true,
      isRequired: true,
      dueDate: true,
    },
    where: { id: event.params.id },
  } satisfies LearningUnitFindUniqueArgs;

  let learningUnit: LearningUnitGetPayload<typeof learningUnitArgs> | null;
  try {
    learningUnit = await db.learningUnit.findUnique(learningUnitArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve learning unit');
    throw error(500);
  }

  if (!learningUnit) {
    throw error(404);
  }

  let isQuizAvailable: boolean;
  try {
    isQuizAvailable =
      (await db.questionAnswer.count({
        where: {
          learningUnitId: event.params.id,
        },
      })) > 0;
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve quiz records');
    throw error(500);
  }

  const learningJourneyArgs = {
    select: {
      lastCheckpoint: true,
      isCompleted: true,
    },
    where: {
      userId_learningUnitId: {
        userId: user.id,
        learningUnitId: event.params.id,
      },
    },
  } satisfies LearningJourneyFindUniqueArgs;

  let learningJourney: LearningJourneyGetPayload<typeof learningJourneyArgs> | null;
  try {
    learningJourney = await db.learningJourney.findUnique(learningJourneyArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve learning journey record');
    throw error(500);
  }

  const quizStatus = getLearningUnitStatus({
    isRequired: learningUnit.isRequired,
    dueDate: learningUnit.dueDate,
    learningJourney: {
      isCompleted: learningJourney ? learningJourney.isCompleted : false,
    },
  });

  const userSentimentArgs = {
    select: {
      hasLiked: true,
    },
    where: {
      userId_learningUnitId: {
        userId: user.id,
        learningUnitId: event.params.id,
      },
    },
  } satisfies LearningUnitSentimentsFindUniqueArgs;

  let sentiment: LearningUnitSentimentsGetPayload<typeof userSentimentArgs> | null;
  try {
    sentiment = await db.learningUnitSentiments.findUnique(userSentimentArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve user sentiment record');
    throw error(500);
  }

  const likesAggregateArgs = {
    where: {
      learningUnitId: event.params.id,
      hasLiked: true,
    },
    _count: {
      hasLiked: true,
    },
  } satisfies LearningUnitSentimentsAggregateArgs;

  let likesAggregate: GetLearningUnitSentimentsAggregateType<typeof likesAggregateArgs>;
  try {
    likesAggregate = await db.learningUnitSentiments.aggregate(likesAggregateArgs);
  } catch {
    logger.error('Failed to get learning unit sentiments aggregate');
    throw error(500);
  }

  const learningUnitSourcesArg = {
    select: {
      title: true,
      sourceURL: true,
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
      learningUnitId: event.params.id,
    },
  } satisfies LearningUnitSourcesFindManyArgs;

  let learningUnitSources: LearningUnitSourcesGetPayload<typeof learningUnitSourcesArg>[];
  try {
    learningUnitSources = await db.learningUnitSources.findMany(learningUnitSourcesArg);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve learning unit sources');
    throw error(500);
  }

  return {
    csrfToken: event.locals.session.csrfToken(),
    id: learningUnit.id,
    tags: learningUnit.tags.map((t) => t.tag),
    title: learningUnit.title,
    summary: learningUnit.summary,
    objectives: learningUnit.objectives,
    url: learningUnit.contentURL,
    createdAt: learningUnit.createdAt,
    createdBy: learningUnit.createdBy,
    isQuizAvailable,
    contentType: learningUnit.contentType,
    isRequired: learningUnit.isRequired,
    dueDate: learningUnit.dueDate,
    lastCheckpoint: Number(learningJourney?.lastCheckpoint),
    quizStatus,
    userSentiment: sentiment?.hasLiked ?? null,
    likesCount: likesAggregate._count.hasLiked,
    learningUnitSources,
  };
};

export const actions: Actions = {
  updateSentiment: async (event) => {
    const logger = event.locals.logger.child({
      handler: 'page_action_update_learning_unit_sentiment',
    });

    const data = await event.request.formData();
    const csrfToken = data.get('csrfToken');
    if (!csrfToken || typeof csrfToken !== 'string') {
      logger.warn('CSRF token is missing');
      throw error(400);
    }

    const isValidCSRFToken = await learnerAuth.validateCSRFToken(event, csrfToken);
    if (!isValidCSRFToken) {
      logger.warn('CSRF token is invalid');
      throw error(400);
    }

    const { user } = event.locals.session;
    if (!user) {
      logger.warn('User not authenticated');
      return redirect(303, '/login');
    }

    if (!data.get('hasLiked')) {
      const deleteUserSentimentArgs = {
        where: {
          userId_learningUnitId: {
            userId: user.id,
            learningUnitId: event.params.id,
          },
        },
      } satisfies LearningUnitSentimentsDeleteArgs;
      try {
        await db.learningUnitSentiments.delete(deleteUserSentimentArgs);
      } catch (err) {
        logger.error({ err }, 'Failed to delete user sentiment record');
        throw error(500);
      }
    } else {
      const hasLiked = data.get('hasLiked') === 'true';

      const learningUnitSentimentsArgs = {
        where: {
          userId_learningUnitId: {
            userId: user.id,
            learningUnitId: event.params.id,
          },
        },
        update: {
          hasLiked,
        },
        create: {
          userId: user.id,
          learningUnitId: event.params.id,
          hasLiked,
        },
      } satisfies LearningUnitSentimentsUpsertArgs;

      try {
        await db.learningUnitSentiments.upsert(learningUnitSentimentsArgs);
      } catch (err) {
        logger.error({ err }, 'Failed to create/update user sentiment record');
        throw error(500);
      }
    }
  },
  updateQuizAttempt: async (event) => {
    const logger = event.locals.logger.child({
      handler: 'page_action_update_quiz_attempt',
    });

    const { user } = event.locals.session;
    if (!user) {
      logger.warn('User not authenticated');
      return redirect(303, '/login');
    }

    const data = await event.request.formData();
    const csrfToken = data.get('csrfToken');
    if (!csrfToken || typeof csrfToken !== 'string') {
      logger.warn('CSRF token is missing');
      throw error(400);
    }

    const isValidCSRFToken = await learnerAuth.validateCSRFToken(event, csrfToken);
    if (!isValidCSRFToken) {
      logger.warn('CSRF token is invalid');
      throw error(400);
    }

    const learningJourneyArgs = {
      where: {
        userId_learningUnitId: { userId: user.id, learningUnitId: event.params.id },
      },
      update: {
        isQuizAttempted: true,
      },
      create: {
        userId: user.id,
        learningUnitId: event.params.id,
        lastCheckpoint: 0,
        isQuizAttempted: true,
      },
    } satisfies LearningJourneyUpsertArgs;

    try {
      await db.learningJourney.upsert(learningJourneyArgs);
    } catch (err) {
      logger.error({ err }, 'Failed to update learning journey quiz attempt');
      throw error(500);
    }

    return redirect(303, `/unit/${event.params.id}/quiz`);
  },
};
