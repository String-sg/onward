import { PrismaClient } from '@prisma/client';
import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const prisma = new PrismaClient();
  try {
    const id = BigInt(params.id);

    const learningUnit = await prisma.learningUnit.findUnique({
      where: { id },
      select: {
        id: true,
        tags: true,
        title: true,
        summary: true,
        contentURL: true,
        createdAt: true,
      },
    });

    if (!learningUnit) throw error(404, 'Learning unit not found');

    return {
      id: learningUnit.id,
      tags: learningUnit.tags,
      title: learningUnit.title,
      summary: learningUnit.summary,
      url: learningUnit.contentURL,
      createdAt: learningUnit.createdAt,
    };
  } finally {
    await prisma.$disconnect();
  }
};
