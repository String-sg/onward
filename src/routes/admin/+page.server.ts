import { error } from '@sveltejs/kit';

import { db, type LearningUnitFindManyArgs, type LearningUnitGetPayload } from '$lib/server/db.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if (!event.locals.session.user) {
    return error(401, 'Unauthorized');
  }

  const logger = event.locals.logger.child({
    userID: event.locals.session.user.id,
    handler: 'page_load_admin',
  });

  const page = Number(event.url.searchParams.get('page')) || 1;
  const pageSize = Number(event.url.searchParams.get('pageSize')) || 10;
  const skip = (page - 1) * pageSize;

  const learningUnitArgs = {
    select: {
      id: true,
      title: true,
      createdBy: true,
      createdAt: true,
      isRecommended: true,
      isRequired: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    skip,
    take: pageSize,
  } satisfies LearningUnitFindManyArgs;

  let learningUnits: LearningUnitGetPayload<typeof learningUnitArgs>[];
  let totalCount: number;
  try {
    [learningUnits, totalCount] = await Promise.all([
      db.learningUnit.findMany(learningUnitArgs),
      db.learningUnit.count(),
    ]);
  } catch (err) {
    logger.error({ err }, 'Failed to fetch learning units');
    throw error(500, 'Internal Server Error');
  }

  return {
    learningUnits,
    totalCount,
    currentPage: page,
    pageSize,
  };
};
