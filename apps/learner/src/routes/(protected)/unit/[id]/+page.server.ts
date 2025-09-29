import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const learningUnit = await db.learningUnit.findUnique({
    where: { id: BigInt(params.id) },
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
  });

  if (!learningUnit) {
    throw error(404);
  }

  const isQuizAvailable =
    (await db.questionAnswer.count({
      where: {
        learningUnitId: BigInt(params.id),
      },
    })) > 0;

  console.log(isQuizAvailable);

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
