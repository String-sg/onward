import { error, redirect } from '@sveltejs/kit';

import {
  db,
  type LearningUnitFindUniqueArgs,
  type LearningUnitGetPayload,
  type QuestionAnswerFindManyArgs,
  type QuestionAnswerGetPayload,
  type TagGetPayload,
} from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'quiz' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return redirect(303, '/login');
  }

  const questionAnswerArgs = {
    select: {
      id: true,
      question: true,
      options: true,
      answer: true,
      explanation: true,
      order: true,
    },
    where: {
      learningUnitId: BigInt(event.params.id),
    },
    orderBy: {
      order: 'asc',
    },
  } satisfies QuestionAnswerFindManyArgs;

  let questionAnswers: QuestionAnswerGetPayload<typeof questionAnswerArgs>[];

  try {
    questionAnswers = await db.questionAnswer.findMany(questionAnswerArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve quiz records');
    throw error(500);
  }

  if (!questionAnswers.length) {
    logger.error('No quiz records found');
    throw error(404);
  }

  const learningUnitTypeArgs = {
    select: {
      collection: {
        select: {
          type: true,
        },
      },
    },
    where: {
      id: BigInt(event.params.id),
    },
  } satisfies LearningUnitFindUniqueArgs;

  let learningUnitType: LearningUnitGetPayload<typeof learningUnitTypeArgs> | null;
  try {
    learningUnitType = await db.learningUnit.findUnique(learningUnitTypeArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve learning unit with type');
    throw error(500);
  }

  if (!learningUnitType) {
    logger.error('Learning unit not found');
    throw error(404);
  }

  const tagArgs = {
    select: {
      label: true,
    },
    where: {
      code: learningUnitType.collection.type,
    },
  };

  let tagLabel: TagGetPayload<typeof tagArgs> | null;

  try {
    tagLabel = await db.tag.findUnique(tagArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve tag label');
    throw error(500);
  }

  if (!tagLabel) {
    logger.error('Tag label not found');
    throw error(404);
  }

  return { questionAnswers, type: learningUnitType.collection.type, label: tagLabel.label };
};
