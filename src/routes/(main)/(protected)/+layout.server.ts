import { error, redirect } from '@sveltejs/kit';

import {
  type CollectionFindManyArgs,
  type CollectionGetPayload,
  db,
  type UserFindUniqueArgs,
  type UserGetPayload,
} from '$lib/server/db';

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
      userProfile: true,
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

  const onboarded = userData?.userProfile;

  const topicArgs = {
    select: {
      id: true,
      title: true,
      description: true,
      tag: {
        select: {
          code: true,
        },
      },
    },
    where: {
      isTopic: true,
    },
    orderBy: {
      title: 'asc',
    },
  } satisfies CollectionFindManyArgs;

  let topics: CollectionGetPayload<typeof topicArgs>[];
  try {
    topics = await db.collection.findMany(topicArgs);
  } catch (err) {
    logger.error({ err }, 'Failed to retrieve topic collections');
    throw error(500);
  }

  return {
    username: user.name,
    csrfToken: event.locals.session.csrfToken(),
    onboarded,
    // Keyed distinctly from the home page's own `topics` (different shape):
    // page data overrides layout data on key collision, so a shared `topics`
    // key would let the home page shadow these and break the onboarding picker.
    onboardingTopics: topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      description: topic.description,
      code: topic.tag?.code ?? null,
    })),
  };
};
