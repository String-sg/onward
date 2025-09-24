import { error, redirect } from '@sveltejs/kit';

import { db, type QuestionAnswerFindManyArgs, type QuestionAnswerGetPayload } from '$lib/server/db';

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

  return { questionAnswers };
};
