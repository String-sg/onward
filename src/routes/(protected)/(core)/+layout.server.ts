import { redirect } from '@sveltejs/kit';

import { getAvatarUrl } from '$lib/server/cache/index.js';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const { user } = event.locals.session;
  if (!user) {
    const logger = event.locals.logger.child({ handler: 'layout_protected_core' });

    logger.warn('User not authenticated');
    return redirect(303, '/login');
  }

  const avatarUrl = await getAvatarUrl(user.id.toString(), user.avatarURL);

  return {
    avatarURL: avatarUrl,
  };
};
