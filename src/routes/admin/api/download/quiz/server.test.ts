import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { GenerateReportOptions } from '$lib/server/reports';

import { GET } from './+server.js';

interface QuizReportRow {
  id: string;
  isCompleted: boolean;
  numberOfAttempts: number;
  user: { name: string; email: string };
  learningUnit: { title: string };
}

const { mockGenerateReport, mockFindMany, mockFindUnique } = vi.hoisted(() => ({
  mockGenerateReport: vi.fn<(options: GenerateReportOptions<QuizReportRow, string>) => Response>(),
  mockFindMany: vi.fn(),
  mockFindUnique: vi.fn(),
}));

vi.mock('$lib/server/reports', async (importActual) => {
  const actual = await importActual<typeof import('$lib/server/reports')>();
  return { ...actual, generateReport: mockGenerateReport };
});

vi.mock('$lib/server/db.js', () => ({
  db: {
    learningJourney: { findMany: mockFindMany },
    learningUnit: { findUnique: mockFindUnique },
  },
}));

const silentLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  child: vi.fn(),
};
silentLogger.child.mockReturnValue(silentLogger);

const buildEvent = (url: string, user: { id: string } | null) =>
  ({
    locals: { logger: silentLogger, session: { user } },
    url: new URL(url),
  }) as unknown as Parameters<typeof GET>[0];

beforeEach(() => {
  vi.clearAllMocks();
  silentLogger.child.mockReturnValue(silentLogger);
  mockGenerateReport.mockReturnValue(new Response('ok'));
});

describe('GET /admin/api/download/quiz', () => {
  test('returns 401 and does not stream when unauthenticated', async () => {
    const event = buildEvent('http://localhost/admin/api/download/quiz', null);

    const response = await GET(event);

    expect(response.status).toBe(401);
    expect(mockGenerateReport).not.toHaveBeenCalled();
  });

  test('declares the report columns, sheet name, and filename', async () => {
    mockFindUnique.mockResolvedValue({ title: 'My Quiz' });
    const event = buildEvent('http://localhost/admin/api/download/quiz?quizId=quiz-1', {
      id: 'admin-1',
    });

    await GET(event);

    const options = mockGenerateReport.mock.calls[0][0];
    expect(options.columns.map((c) => c.header)).toEqual([
      'Name',
      'Email',
      'Quiz Title',
      'Is Completed',
      'Number of Attempts',
    ]);
    expect(options.sheetName).toBe('Quiz Report');
    expect(options.filename).toMatch(/^\d{14}_My_Quiz_user_report\.xlsx$/);
  });

  test('maps a record to row values', async () => {
    mockFindUnique.mockResolvedValue({ title: 'My Quiz' });
    const event = buildEvent('http://localhost/admin/api/download/quiz?quizId=quiz-1', {
      id: 'admin-1',
    });
    const record = {
      id: '1',
      isCompleted: true,
      numberOfAttempts: 3,
      user: { name: 'Ann', email: 'a@x.co' },
      learningUnit: { title: 'Quiz X' },
    };

    await GET(event);

    const options = mockGenerateReport.mock.calls[0][0];
    expect(options.columns.map((c) => c.value(record))).toEqual([
      'Ann',
      'a@x.co',
      'Quiz X',
      'Yes',
      3,
    ]);
  });

  test('fetchBatch advances the keyset cursor and honors the quizId filter', async () => {
    mockFindUnique.mockResolvedValue({ title: 'My Quiz' });
    const event = buildEvent('http://localhost/admin/api/download/quiz?quizId=quiz-1', {
      id: 'admin-1',
    });
    const fullBatch = Array.from({ length: 100 }, (_, i) => ({ id: `id-${i}` }));
    mockFindMany.mockResolvedValueOnce(fullBatch).mockResolvedValueOnce([{ id: 'id-100' }]);

    await GET(event);
    const { fetchBatch } = mockGenerateReport.mock.calls[0][0];
    const first = await fetchBatch(undefined);
    const second = await fetchBatch('id-99');

    expect(mockFindMany.mock.calls[0][0]).toMatchObject({
      where: { learningUnit: { questionAnswers: { some: {} }, id: 'quiz-1' } },
      orderBy: { id: 'asc' },
      take: 100,
    });
    expect(mockFindMany.mock.calls[0][0]).not.toHaveProperty('cursor');
    expect(first.nextCursor).toBe('id-99');
    expect(mockFindMany.mock.calls[1][0]).toMatchObject({ skip: 1, cursor: { id: 'id-99' } });
    expect(second.nextCursor).toBeUndefined();
  });

  test('returns 404 and does not stream when a given quizId resolves to no quiz', async () => {
    mockFindUnique.mockResolvedValue(null);
    const event = buildEvent('http://localhost/admin/api/download/quiz?quizId=missing', {
      id: 'admin-1',
    });

    const response = await GET(event);

    expect(response.status).toBe(404);
    expect(mockGenerateReport).not.toHaveBeenCalled();
  });

  test('omits the id filter and the title lookup when no quizId is given', async () => {
    const event = buildEvent('http://localhost/admin/api/download/quiz', { id: 'admin-1' });
    mockFindMany.mockResolvedValue([]);

    await GET(event);
    const { fetchBatch } = mockGenerateReport.mock.calls[0][0];
    await fetchBatch(undefined);

    expect(mockFindUnique).not.toHaveBeenCalled();
    expect(mockFindMany.mock.calls[0][0].where).toEqual({
      learningUnit: { questionAnswers: { some: {} } },
    });
  });
});
