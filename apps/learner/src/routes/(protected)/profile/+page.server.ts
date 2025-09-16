import { error, redirect } from '@sveltejs/kit';
import { startOfMonth, startOfWeek } from 'date-fns';

import { db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const { user } = event.locals.session;
  if (!user) {
    return redirect(303, '/login');
  }

  const logger = event.locals.logger.child({ handler: 'user_profile', user_id: user.id });

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

    const [learningUnitsConsumedByWeek, learningUnitsCompletedByWeek] = [
      learningUnitsByWeek.length,
      learningUnitsByWeek.filter((unit) => unit.isCompleted).length,
    ];

    const [learningUnitsConsumedByMonth, learningUnitsCompletedByMonth] = [
      learningUnitsByMonth.length,
      learningUnitsByMonth.filter((unit) => unit.isCompleted).length,
    ];

    return {
      name: user.name,
      email: user.email,
      learningUnitsConsumedByMonth: learningUnitsConsumedByMonth,
      learningUnitsConsumedByWeek: learningUnitsConsumedByWeek,
      learningUnitsCompletedByMonth: learningUnitsCompletedByMonth,
      learningUnitsCompletedByWeek: learningUnitsCompletedByWeek,
    };
  } catch (err) {
    logger.error(err, 'Unknown error occurred while retrieving learning journey counts');
    throw error(500);
  }
};
