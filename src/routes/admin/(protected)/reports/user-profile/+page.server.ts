import { error, redirect } from '@sveltejs/kit';

import { db, type UserProfileFindManyArgs, type UserProfileGetPayload } from '$lib/server/db.js';

import type { PageServerLoad } from './$types';

const PAGE_SIZE = 10;

export const load: PageServerLoad = async (event) => {
  const logger = event.locals.logger.child({ handler: 'page_load_user_profile_report' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    throw redirect(303, '/admin');
  }

  const currentPage = Number(event.url.searchParams.get('page')) || 1;
  const skip = (currentPage - 1) * PAGE_SIZE;

  const recordArgs = {
    select: {
      userId: true,
      isSubscribed: true,
      user: {
        select: { name: true, email: true },
      },
      interests: {
        select: { collection: { select: { title: true } } },
      },
    },
    orderBy: { user: { name: 'asc' } },
    skip,
    take: PAGE_SIZE,
  } satisfies UserProfileFindManyArgs;

  try {
    const [records, totalCount] = await Promise.all([
      db.userProfile.findMany(recordArgs),
      db.userProfile.count(),
    ]);

    return {
      records: records as UserProfileGetPayload<typeof recordArgs>[],
      totalCount,
      currentPage,
      pageSize: PAGE_SIZE,
    };
  } catch (err) {
    logger.error({ err }, 'Failed to fetch user profile report data');
    throw error(500);
  }
};
