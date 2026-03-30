import { error, redirect } from '@sveltejs/kit';

import {
  ContentType,
  db,
  type LearningJourneyFindManyArgs,
  type LearningJourneyGetPayload,
} from '$lib/server/db.js';

import type { PageServerLoad } from './$types';

const PAGE_SIZE = 10;

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_reports' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    throw redirect(303, '/admin');
  }

  const currentPage = Number(event.url.searchParams.get('page')) || 1;
  const quizId = event.url.searchParams.get('quizId')?.trim() || undefined;
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where = {
    learningUnit: {
      contents: { some: { type: ContentType.QUIZ } },
      ...(quizId && { id: quizId }),
    },
  };

  const recordArgs = {
    where,
    select: {
      id: true,
      isCompleted: true,
      numberOfAttempts: true,
      user: {
        select: { name: true, email: true },
      },
      learningUnit: {
        select: { title: true },
      },
    },
    orderBy: { user: { name: 'asc' } },
    skip,
    take: PAGE_SIZE,
  } satisfies LearningJourneyFindManyArgs;

  try {
    const [quizzes, records, totalCount] = await Promise.all([
      db.learningUnit.findMany({
        where: {
          contents: { some: { type: ContentType.QUIZ } },
          status: 'PUBLISHED',
          isRequired: true,
        },
        select: { id: true, title: true },
        orderBy: { title: 'asc' },
      }),
      db.learningJourney.findMany(recordArgs),
      db.learningJourney.count({ where }),
    ]);

    return {
      quizzes,
      records: records as LearningJourneyGetPayload<typeof recordArgs>[],
      totalCount,
      currentPage,
      pageSize: PAGE_SIZE,
      quizId: quizId ?? '',
    };
  } catch (err) {
    logger.error({ err }, 'Failed to fetch report data');
    throw error(500);
  }
};
