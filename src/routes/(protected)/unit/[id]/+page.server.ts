import { error, redirect } from '@sveltejs/kit';

import { db, type LearningUnitFindUniqueArgs, type LearningUnitGetPayload } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_learning_unit' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return redirect(303, '/login');
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
      contentURL: true,
      createdAt: true,
      createdBy: true,
    },
    where: { id: BigInt(event.params.id) },
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
          learningUnitId: BigInt(event.params.id),
        },
      })) > 0;
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve quiz records');
    throw error(500);
  }

  return {
    id: learningUnit.id,
    tags: learningUnit.tags.map((t) => t.tag),
    title: learningUnit.title,
    summary: learningUnit.summary,
    url: learningUnit.contentURL,
    createdAt: learningUnit.createdAt,
    createdBy: learningUnit.createdBy,
    isQuizAvailable,
  };
};
