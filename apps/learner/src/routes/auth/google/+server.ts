import { redirect } from '@sveltejs/kit';

import { nanoid } from '$lib/helpers/index.js';
import { generateAuthURL } from '$lib/server/auth.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'google_oauth2_initiate' });

  const state = Buffer.from(
    JSON.stringify({
      csrf_token: event.locals.session.csrfToken(),
      return_to: event.url.searchParams.get('return_to') || '/',
    }),
  ).toString('base64url');

  const codeVerifier = nanoid(64);
  const authURL = generateAuthURL({
    origin: event.url.origin,
    state,
    codeVerifier,
  });

  event.locals.session.set('codeVerifier', codeVerifier);
  event.locals.session.set('authURL', authURL);

  logger.info('Redirecting to Google OAuth2 authorization URL');

  return redirect(307, authURL);
};
