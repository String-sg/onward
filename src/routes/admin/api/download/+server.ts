import { json } from '@sveltejs/kit';
import * as XLSX from 'xlsx';

import { ContentType, db, type LearningJourneyFindManyArgs } from '$lib/server/db.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_download_quiz_report' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return json(null, { status: 401 });
  }

  const quizId = event.url.searchParams.get('quizId')?.trim() || undefined;

  const reportArgs = {
    select: {
      isCompleted: true,
      numberOfAttempts: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      learningUnit: {
        select: {
          title: true,
        },
      },
    },
    where: {
      learningUnit: {
        contentItems: { some: { type: ContentType.QUIZ } },
        ...(quizId && { id: quizId }),
      },
    },
    orderBy: {
      user: { name: 'asc' },
    },
  } satisfies LearningJourneyFindManyArgs;

  try {
    const records = await db.learningJourney.findMany(reportArgs);

    const rows = records.map((r) => ({
      Name: r.user.name,
      Email: r.user.email,
      'Quiz Title': r.learningUnit.title,
      'Is Completed': r.isCompleted ? 'Yes' : 'No',
      'Number of Attempts': r.numberOfAttempts,
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Quiz Report');

    const buffer: Uint8Array = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer.buffer as ArrayBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="quiz-report.xlsx"',
      },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to fetch quiz report data');
    return new Response('Failed to generate report', { status: 500 });
  }
};
