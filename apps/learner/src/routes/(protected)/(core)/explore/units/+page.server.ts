import { db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const learningUnits = await db.learningUnit.findMany({
    select: {
      id: true,
      createdAt: true,
      title: true,
      summary: true,
      contentURL: true,
      createdBy: true,
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
    },
  });
  return {
    learningUnits: learningUnits.map((unit) => ({
      ...unit,
      tags: unit.tags.map((t) => t.tag),
    })),
  };
};
