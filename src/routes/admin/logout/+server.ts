import { redirect, type RequestHandler } from '@sveltejs/kit';

import { adminAuth } from '$lib/server/auth/index.js';

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_logout' });

  const { user } = event.locals.session;
  if (!user) {
    logger.warn('User not authenticated');
    return redirect(303, '/admin');
  }

  try {
    await adminAuth.signOut(event);
  } catch (err) {
    logger.error({ err, email: user.email }, 'Failed to sign out user');
    return redirect(302, '/admin');
  }

  logger.info({ email: user.email }, 'Successfully signed out user');

  return redirect(302, '/admin');
};
