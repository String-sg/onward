import { error, redirect } from '@sveltejs/kit';

import auth from '$lib/server/auth/index.js';
import {
  db,
  type LearningJourneyUpsertArgs,
  type LearningUnitFindUniqueArgs,
  type LearningUnitGetPayload,
} from '$lib/server/db';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_quiz' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return redirect(303, '/login');
  }

  const learningUnitArgs = {
    select: {
      collection: {
        select: {
          type: true,
        },
      },
      questionAnswers: {
        select: {
          id: true,
          question: true,
          options: true,
          answer: true,
          explanation: true,
          order: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
    where: {
      id: event.params.id,
    },
  } satisfies LearningUnitFindUniqueArgs;

  let learningUnit: LearningUnitGetPayload<typeof learningUnitArgs> | null;
  try {
    learningUnit = await db.learningUnit.findUnique(learningUnitArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve learning unit with quiz data');
    throw error(500);
  }

  if (!learningUnit) {
    throw error(404);
  }

  if (!learningUnit.questionAnswers.length) {
    logger.warn('No quiz records found');
    return redirect(303, `/unit/${event.params.id}`);
  }

  return {
    csrfToken: event.locals.session.csrfToken(),
    questionAnswers: learningUnit.questionAnswers,
    collectionType: learningUnit.collection.type,
  };
};

export const actions: Actions = {
  updateLJCompletionStatus: async (event) => {
    const logger = event.locals.logger.child({
      handler: 'page_action_update_learning_unit_completion_status',
    });

    const data = await event.request.formData();
    const csrfToken = data.get('csrfToken');
    if (!csrfToken || typeof csrfToken !== 'string') {
      logger.warn('CSRF token is missing');
      throw error(400);
    }

    const isValidCSRFToken = await auth.validateCSRFToken(event, csrfToken);
    if (!isValidCSRFToken) {
      logger.warn('CSRF token is invalid');
      throw error(400);
    }

    const { user } = event.locals.session;
    if (!user) {
      logger.warn('User not authenticated');
      return redirect(303, '/login');
    }

    const learningJourneyArgs = {
      where: {
        userId_learningUnitId: { userId: user.id, learningUnitId: event.params.id },
      },
      update: { isCompleted: true },
      create: {
        userId: user.id,
        learningUnitId: event.params.id,
        isCompleted: true,
        lastCheckpoint: 0,
      },
    } satisfies LearningJourneyUpsertArgs;

    try {
      await db.learningJourney.upsert(learningJourneyArgs);
    } catch (err) {
      logger.error({ err }, 'Failed to update learning journey completion status');
      throw error(500);
    }
  },
};
