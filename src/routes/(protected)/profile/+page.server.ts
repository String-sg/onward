import { error, redirect } from '@sveltejs/kit';

import { getBase64EncodedAvatar } from '$lib/server/cache/index.js';
import { db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_user_profile' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return redirect(303, '/login');
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  try {
    const [byWeek, byMonth, byYear, byAll] = await Promise.all([
      db.learningJourney.groupBy({
        by: ['isCompleted'],
        where: { userId: user.id, updatedAt: { gte: sevenDaysAgo } },
        _count: { _all: true },
      }),
      db.learningJourney.groupBy({
        by: ['isCompleted'],
        where: { userId: user.id, updatedAt: { gte: thirtyDaysAgo } },
        _count: { _all: true },
      }),
      db.learningJourney.groupBy({
        by: ['isCompleted'],
        where: { userId: user.id, updatedAt: { gte: oneYearAgo } },
        _count: { _all: true },
      }),
      db.learningJourney.groupBy({
        by: ['isCompleted'],
        where: { userId: user.id },
        _count: { _all: true },
        _min: { updatedAt: true },
      }),
    ]);

    const firstRecordDateAll = byAll.find((g) => g._min.updatedAt)?._min.updatedAt;

    return {
      name: user.name,
      email: user.email,
      avatar: await getBase64EncodedAvatar(user.id),
      learningUnitsConsumedByWeek: byWeek.reduce((total, group) => total + group._count._all, 0),
      learningUnitsConsumedByMonth: byMonth.reduce((total, group) => total + group._count._all, 0),
      learningUnitsConsumedByYear: byYear.reduce((total, group) => total + group._count._all, 0),
      learningUnitsConsumedByAll: byAll.reduce((total, group) => total + group._count._all, 0),
      learningUnitsCompletedByWeek: byWeek.find((group) => group.isCompleted)?._count._all ?? 0,
      learningUnitsCompletedByMonth: byMonth.find((group) => group.isCompleted)?._count._all ?? 0,
      learningUnitsCompletedByYear: byYear.find((group) => group.isCompleted)?._count._all ?? 0,
      learningUnitsCompletedByAll: byAll.find((group) => group.isCompleted)?._count._all ?? 0,
      firstRecordDateAll,
    };
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to retrieve learning journey counts');
    throw error(500);
  }
};
