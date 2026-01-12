import { db } from '$lib/server/db.js';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const learningUnits = await db.learningUnit.findMany({
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
  });

  return {
    learningUnits,
  };
};
