import { redirect } from '@sveltejs/kit';

import { getBase64EncodedAvatar } from '$lib/server/cache/index.js';

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const { user } = event.locals.session;
  if (!user) {
    const logger = event.locals.logger.child({ handler: 'layout_protected_core' });

    logger.warn('User not authenticated');
    return redirect(303, '/login');
  }

  return {
    avatar: await getBase64EncodedAvatar(BigInt(user.id)),
    username: user.name,
  };
};
