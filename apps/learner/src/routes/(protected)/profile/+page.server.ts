import { error, redirect } from '@sveltejs/kit';
import { startOfMonth, startOfWeek } from 'date-fns';

import { db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'user_profile' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User is not authenticated.');
    return redirect(303, '/login');
  }

  const now = new Date();
  const firstOfMonth = startOfMonth(now);
  const startOfWeekMonday = startOfWeek(now, { weekStartsOn: 1 });

  const userId = BigInt(user.id);

  try {
    const [learningUnitsByWeek, learningUnitsByMonth] = await Promise.all([
      db.learningJourney.findMany({
        where: { userId: userId, updatedAt: { gte: startOfWeekMonday } },
        select: { isCompleted: true },
      }),
      db.learningJourney.findMany({
        where: { userId: userId, updatedAt: { gte: firstOfMonth } },
        select: { isCompleted: true },
      }),
    ]);

    return {
      name: user.name,
      email: user.email,
      learningUnitsConsumedByMonth: learningUnitsByMonth.length,
      learningUnitsConsumedByWeek: learningUnitsByWeek.length,
      learningUnitsCompletedByMonth: learningUnitsByMonth.filter((unit) => unit.isCompleted).length,
      learningUnitsCompletedByWeek: learningUnitsByWeek.filter((unit) => unit.isCompleted).length,
    };
  } catch (err) {
    logger.error(
      { err, userId },
      'Unknown error occurred while retrieving learning journey counts',
    );
    throw error(500);
  }
};
