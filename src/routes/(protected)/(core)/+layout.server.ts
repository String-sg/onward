import { redirect } from '@sveltejs/kit';

import { logger } from '$lib/server/logger';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const { user } = event.locals.session;

  if (!user) {
    logger.warn('User not authenticated');
    return redirect(303, '/login');
  }

  return {
    avatarURL: user.avatarURL,
  };
};
