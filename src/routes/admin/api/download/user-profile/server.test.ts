import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { GenerateReportOptions } from '$lib/server/reports';

import { GET } from './+server.js';

interface UserProfileReportRow {
  userId: string;
  isSubscribed: boolean;
  user: { name: string; email: string };
  interests: { collection: { title: string } }[];
}

const { mockGenerateReport, mockFindMany } = vi.hoisted(() => ({
  mockGenerateReport:
    vi.fn<(options: GenerateReportOptions<UserProfileReportRow, string>) => Response>(),
  mockFindMany: vi.fn(),
}));

vi.mock('$lib/server/reports', async (importActual) => {
  const actual = await importActual<typeof import('$lib/server/reports')>();
  return { ...actual, generateReport: mockGenerateReport };
});

vi.mock('$lib/server/db.js', () => ({
  db: {
    userProfile: { findMany: mockFindMany },
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

describe('GET /admin/api/download/user-profile', () => {
  test('returns 401 and does not stream when unauthenticated', async () => {
    const event = buildEvent('http://localhost/admin/api/download/user-profile', null);

    const response = await GET(event);

    expect(response.status).toBe(401);
    expect(mockGenerateReport).not.toHaveBeenCalled();
  });

  test('declares the report columns, sheet name, and filename', async () => {
    const event = buildEvent('http://localhost/admin/api/download/user-profile', { id: 'admin-1' });

    await GET(event);

    const options = mockGenerateReport.mock.calls[0][0];
    expect(options.columns.map((c) => c.header)).toEqual([
      'Name',
      'Email',
      'Content Preferences',
      'Subscribed?',
    ]);
    expect(options.sheetName).toBe('User Profile Report');
    expect(options.filename).toMatch(/^\d{14}_user_profile_report\.xlsx$/);
  });

  test('maps a profile to row values with comma-joined preferences', async () => {
    const event = buildEvent('http://localhost/admin/api/download/user-profile', { id: 'admin-1' });
    const record = {
      userId: 'u1',
      isSubscribed: true,
      user: { name: 'Ann', email: 'a@x.co' },
      interests: [{ collection: { title: 'AI' } }, { collection: { title: 'Math' } }],
    };

    await GET(event);

    const options = mockGenerateReport.mock.calls[0][0];
    expect(options.columns.map((c) => c.value(record))).toEqual([
      'Ann',
      'a@x.co',
      'AI, Math',
      'Yes',
    ]);
  });

  test('renders blank preferences and No when a profile has no interests', async () => {
    const event = buildEvent('http://localhost/admin/api/download/user-profile', { id: 'admin-1' });
    const record = {
      userId: 'u2',
      isSubscribed: false,
      user: { name: 'Bob', email: 'b@x.co' },
      interests: [],
    };

    await GET(event);

    const options = mockGenerateReport.mock.calls[0][0];
    expect(options.columns.map((c) => c.value(record))).toEqual(['Bob', 'b@x.co', '', 'No']);
  });

  test('fetchBatch advances the keyset cursor over all profiles', async () => {
    const event = buildEvent('http://localhost/admin/api/download/user-profile', { id: 'admin-1' });
    const fullBatch = Array.from({ length: 100 }, (_, i) => ({ userId: `u-${i}` }));
    mockFindMany.mockResolvedValueOnce(fullBatch).mockResolvedValueOnce([{ userId: 'u-100' }]);

    await GET(event);
    const { fetchBatch } = mockGenerateReport.mock.calls[0][0];
    const first = await fetchBatch(undefined);
    const second = await fetchBatch('u-99');

    expect(mockFindMany.mock.calls[0][0]).toMatchObject({ orderBy: { userId: 'asc' }, take: 100 });
    expect(mockFindMany.mock.calls[0][0]).not.toHaveProperty('cursor');
    expect(first.nextCursor).toBe('u-99');
    expect(mockFindMany.mock.calls[1][0]).toMatchObject({ skip: 1, cursor: { userId: 'u-99' } });
    expect(second.nextCursor).toBeUndefined();
  });
});
