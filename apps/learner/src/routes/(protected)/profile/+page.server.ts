import { error } from '@sveltejs/kit';
import { startOfMonth, startOfWeek } from 'date-fns';

import { db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

const validateSession = (event: Parameters<PageServerLoad>[0]): bigint => {
  const userIdRaw = event.locals.session?.user?.id;
  if (!userIdRaw) {
    throw error(401, 'User is not authenticated');
  }

  try {
    return BigInt(userIdRaw);
  } catch {
    throw error(400, 'Invalid user ID format');
  }
};

export const load: PageServerLoad = async (event) => {
  const userId = validateSession(event);

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  if (!user) {
    throw error(404, 'User not found');
  }

  const now = new Date();

  const firstOfMonth = startOfMonth(now);
  const startOfWeekMonday = startOfWeek(now, { weekStartsOn: 1 });

  const learningUnitsConsumedByWeek = await db.learningJourney.count({
    where: {
      userId: userId,
      updatedAt: { gte: startOfWeekMonday },
    },
  });

  const learningUnitsCompletedByWeek = await db.learningJourney.count({
    where: {
      userId: userId,
      isCompleted: true,
      updatedAt: { gte: startOfWeekMonday },
    },
  });

  const learningUnitsConsumedByMonth = await db.learningJourney.count({
    where: {
      userId: userId,
      updatedAt: { gte: firstOfMonth },
    },
  });

  const learningUnitsCompletedByMonth = await db.learningJourney.count({
    where: {
      userId: userId,
      isCompleted: true,
      updatedAt: { gte: firstOfMonth },
    },
  });

  return {
    name: user.name,
    email: user.email,
    learningUnitsConsumedByMonth: learningUnitsConsumedByMonth.toString(),
    learningUnitsConsumedByWeek: learningUnitsConsumedByWeek.toString(),
    learningUnitsCompletedByMonth: learningUnitsCompletedByMonth.toString(),
    learningUnitsCompletedByWeek: learningUnitsCompletedByWeek.toString(),
  };
};
