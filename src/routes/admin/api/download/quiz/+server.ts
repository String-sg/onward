import { json } from '@sveltejs/kit';

import {
  db,
  type LearningJourneyFindManyArgs,
  type LearningJourneyGetPayload,
  type LearningUnitFindUniqueArgs,
  type LearningUnitGetPayload,
} from '$lib/server/db.js';
import { formatTimestamp, generateReport } from '$lib/server/reports';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_download_quiz_report' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return json(null, { status: 401 });
  }

  const quizId = event.url.searchParams.get('quizId')?.trim() || undefined;

  const batchSize = 100;

  const recordArgs = {
    select: {
      id: true,
      isCompleted: true,
      numberOfAttempts: true,
      user: { select: { name: true, email: true } },
      learningUnit: { select: { title: true } },
    },
    where: {
      learningUnit: {
        questionAnswers: { some: {} },
        ...(quizId && { id: quizId }),
      },
    },
    orderBy: { id: 'asc' },
    take: batchSize,
  } satisfies LearningJourneyFindManyArgs;

  type QuizRow = LearningJourneyGetPayload<typeof recordArgs>;

  let quiz: LearningUnitGetPayload<{ select: { title: true } }> | null = null;
  if (quizId) {
    const quizArgs = {
      select: { title: true },
      where: { id: quizId },
    } satisfies LearningUnitFindUniqueArgs;

    try {
      quiz = await db.learningUnit.findUnique(quizArgs);
    } catch (err) {
      logger.error({ err }, 'Failed to look up quiz title');
      return json(null, { status: 500 });
    }

    if (!quiz) {
      logger.warn({ quizId }, 'Quiz not found');
      return json(null, { status: 404 });
    }
  }

  const quizTitle = (quiz?.title ?? 'quiz').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${formatTimestamp(new Date())}_${quizTitle}_user_report.xlsx`;

  return generateReport<QuizRow, string>({
    filename,
    sheetName: 'Quiz Report',
    columns: [
      { header: 'Name', value: (row) => row.user.name },
      { header: 'Email', value: (row) => row.user.email },
      { header: 'Quiz Title', value: (row) => row.learningUnit.title },
      { header: 'Is Completed', value: (row) => (row.isCompleted ? 'Yes' : 'No') },
      { header: 'Number of Attempts', value: (row) => row.numberOfAttempts },
    ],
    fetchBatch: async (cursor) => {
      const rows = await db.learningJourney.findMany({
        ...recordArgs,
        ...(cursor && { skip: 1, cursor: { id: cursor } }),
      });
      const nextCursor = rows.length === batchSize ? rows[rows.length - 1].id : undefined;
      return { rows, nextCursor };
    },
    onError: (err) => logger.error({ err }, 'Failed while streaming quiz report'),
  });
};
