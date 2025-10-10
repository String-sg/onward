import { error, redirect } from '@sveltejs/kit';
import { startOfMonth, startOfWeek } from 'date-fns';

import { getAvatarUrl } from '$lib/server/cache/index.js';
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
  const firstOfMonth = startOfMonth(now);
  const startOfWeekMonday = startOfWeek(now, { weekStartsOn: 1 });

  try {
    const [byWeek, byMonth] = await Promise.all([
      db.learningJourney.groupBy({
        by: ['isCompleted'],
        where: { userId: BigInt(user.id), updatedAt: { gte: startOfWeekMonday } },
        _count: { _all: true },
      }),
      db.learningJourney.groupBy({
        by: ['isCompleted'],
        where: { userId: BigInt(user.id), updatedAt: { gte: firstOfMonth } },
        _count: { _all: true },
      }),
    ]);

    return {
      name: user.name,
      email: user.email,
      avatarURL: await getAvatarUrl(user.id.toString(), user.avatarURL),
      learningUnitsConsumedByMonth: byMonth.reduce((total, group) => total + group._count._all, 0),
      learningUnitsConsumedByWeek: byWeek.reduce((total, group) => total + group._count._all, 0),
      learningUnitsCompletedByMonth: byMonth.find((group) => group.isCompleted)?._count._all ?? 0,
      learningUnitsCompletedByWeek: byWeek.find((group) => group.isCompleted)?._count._all ?? 0,
    };
  } catch (err) {
    logger.error({ err, userId: user.id }, 'Failed to retrieve learning journey counts');
    throw error(500);
  }
};
