import { redirect } from '@sveltejs/kit';

import { exchangeGoogleCodeForIdToken, verifyGoogleIdToken } from '$lib/server/auth.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
  const { logger, session } = locals;

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state) {
    logger.error('Missing "code" or "state" from Google OAuth2 callback.');
    return redirect(302, '/login?error=oauth_failed');
  }

  const authURL = session.get<string>('authURL');
  const codeVerifier = session.get<string>('codeVerifier');
  if (!authURL || !codeVerifier) {
    logger.error('Missing "authURL" or "codeVerifier" from session.');
    return redirect(302, '/login?error=oauth_failed');
  }

  const originalState = new URL(authURL).searchParams.get('state');
  if (!originalState || originalState !== state) {
    logger.error('Mismatch between original and callback state.');
    return redirect(302, '/login?error=oauth_failed');
  }

  const idToken = await exchangeGoogleCodeForIdToken({
    origin: url.origin,
    code,
    codeVerifier,
  });
  if (!idToken) {
    logger.error('Missing "idToken" from Google OAuth2 callback.');
    return redirect(302, '/login?error=oauth_failed');
  }

  const profile = await verifyGoogleIdToken(idToken);
  if (!profile) {
    logger.error('Invalid "idToken" from Google OAuth2 callback.');
    return redirect(302, '/login?error=oauth_failed');
  }

  return redirect(302, '/');
};
