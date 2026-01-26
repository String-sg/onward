import { error, redirect } from '@sveltejs/kit';

import { db, type UserFindUniqueArgs, type UserGetPayload } from '$lib/server/db';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const { user } = event.locals.session;
  const logger = event.locals.logger.child({ handler: 'layout_protected' });

  if (!user) {
    logger.warn('User not authenticated');
    return redirect(303, '/login');
  }

  const userArgs = {
    select: {
      learningFrequency: true,
      interests: {
        select: {
          collectionId: true,
        },
      },
    },
    where: { id: user.id },
  } satisfies UserFindUniqueArgs;

  let userData: UserGetPayload<typeof userArgs> | null;

  try {
    userData = await db.user.findUnique(userArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve user record');
    throw error(500);
  }

  if (!userData) {
    logger.error('User not found');
    throw error(404);
  }

  const onboarding =
    !userData?.learningFrequency || !userData?.interests || userData.interests.length === 0;

  return {
    username: user.name,
    csrfToken: event.locals.session.csrfToken(),
    onboarding,
  };
};
