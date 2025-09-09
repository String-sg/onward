import { redirect } from '@sveltejs/kit';

import { nanoid } from '$lib/helpers/index.js';
import { generateGoogleAuthURL } from '$lib/server/auth.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const state = Buffer.from(
    JSON.stringify({
      csrf_token: event.locals.session.csrfToken(),
      return_to: event.url.searchParams.get('return_to') || '/',
    }),
  ).toString('base64url');

  const codeVerifier = nanoid(64);
  const authURL = generateGoogleAuthURL({
    origin: event.url.origin,
    state,
    codeVerifier,
  });

  event.locals.session.set('codeVerifier', codeVerifier);
  event.locals.session.set('authURL', authURL);

  return redirect(307, authURL);
};
