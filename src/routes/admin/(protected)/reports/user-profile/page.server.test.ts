import { beforeEach, describe, expect, test, vi } from 'vitest';

import { load } from './+page.server.js';

const { mockProfileFindMany, mockProfileCount } = vi.hoisted(() => ({
  mockProfileFindMany: vi.fn(),
  mockProfileCount: vi.fn(),
}));

vi.mock('$lib/server/db.js', () => ({
  db: {
    userProfile: { findMany: mockProfileFindMany, count: mockProfileCount },
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

const buildEvent = (url: string) =>
  ({
    locals: { logger: silentLogger, session: { user: { id: 'admin-1' } } },
    url: new URL(url),
  }) as unknown as Parameters<typeof load>[0];

beforeEach(() => {
  vi.clearAllMocks();
  silentLogger.child.mockReturnValue(silentLogger);
  mockProfileFindMany.mockResolvedValue([]);
  mockProfileCount.mockResolvedValue(0);
});

describe('user-profile report load', () => {
  test('returns onboarding records ordered by user name', async () => {
    const profiles = [
      { userId: 'u1', isSubscribed: true, user: { name: 'Ann', email: 'a@x.co' }, interests: [] },
    ];
    mockProfileFindMany.mockResolvedValue(profiles);
    mockProfileCount.mockResolvedValue(1);
    const event = buildEvent('http://localhost/admin/reports/user-profile');

    const data = await load(event);
    if (!data) {
      throw new Error('expected the load to return report data');
    }

    expect(data.records).toEqual(profiles);
    expect(data.totalCount).toBe(1);
    expect(mockProfileFindMany.mock.calls[0][0]).toMatchObject({
      orderBy: { user: { name: 'asc' } },
      skip: 0,
      take: 10,
    });
  });

  test('paginates records with skip', async () => {
    const event = buildEvent('http://localhost/admin/reports/user-profile?page=3');

    await load(event);

    expect(mockProfileFindMany.mock.calls[0][0]).toMatchObject({ skip: 20, take: 10 });
  });
});
