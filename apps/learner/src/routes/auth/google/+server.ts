import { redirect } from '@sveltejs/kit';
import { nanoid } from 'nanoid';

import { generateGoogleAuthURL } from '$lib/server/auth.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
  const { session } = locals;

  const codeVerifier = nanoid(64);
  const authURL = generateGoogleAuthURL({
    origin: url.origin,
    state: session.csrfToken(),
    codeVerifier,
  });

  session.set('authURL', authURL);
  session.set('codeVerifier', codeVerifier);

  return redirect(307, authURL);
};
