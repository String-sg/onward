import { error, redirect } from '@sveltejs/kit';

import { db, type LearningUnitFindUniqueArgs, type LearningUnitGetPayload } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_quiz' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return redirect(303, '/login');
  }

  const learningUnitArgs = {
    select: {
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
      collection: {
        select: {
          type: true,
          tags: {
            select: {
              tag: {
                select: {
                  label: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      id: BigInt(event.params.id),
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
    questionAnswers: learningUnit.questionAnswers,
    type: learningUnit.collection.type,
    label: learningUnit.collection.tags[0]?.tag.label,
  };
};
