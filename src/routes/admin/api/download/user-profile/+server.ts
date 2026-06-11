import { json } from '@sveltejs/kit';

import { db, type UserProfileFindManyArgs, type UserProfileGetPayload } from '$lib/server/db.js';
import { formatTimestamp, generateReport } from '$lib/server/reports';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_download_user_profile_report' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return json(null, { status: 401 });
  }

  const batchSize = 100;

  const recordArgs = {
    select: {
      userId: true,
      isSubscribed: true,
      user: { select: { name: true, email: true } },
      interests: { select: { collection: { select: { title: true } } } },
    },
    orderBy: { userId: 'asc' },
    take: batchSize,
  } satisfies UserProfileFindManyArgs;

  type UserProfileRow = UserProfileGetPayload<typeof recordArgs>;

  const filename = `${formatTimestamp(new Date())}_user_profile_report.xlsx`;

  return generateReport<UserProfileRow, string>({
    filename,
    sheetName: 'User Profile Report',
    columns: [
      { header: 'Name', value: (row) => row.user.name },
      { header: 'Email', value: (row) => row.user.email },
      {
        header: 'Content Preferences',
        value: (row) => row.interests.map((interest) => interest.collection.title).join(', '),
      },
      { header: 'Subscribed?', value: (row) => (row.isSubscribed ? 'Yes' : 'No') },
    ],
    fetchBatch: async (cursor) => {
      const rows = await db.userProfile.findMany({
        ...recordArgs,
        ...(cursor && { skip: 1, cursor: { userId: cursor } }),
      });
      const nextCursor = rows.length === batchSize ? rows[rows.length - 1].userId : undefined;
      return { rows, nextCursor };
    },
    onError: (err) => logger.error({ err }, 'Failed while streaming user profile report'),
  });
};
