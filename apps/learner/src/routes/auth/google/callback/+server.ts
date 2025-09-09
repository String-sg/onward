import { redirect } from '@sveltejs/kit';

import { auth, exchangeGoogleCodeForIdToken, verifyGoogleIdToken } from '$lib/server/auth.js';
import { db, PrismaClientKnownRequestError } from '$lib/server/db.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const code = event.url.searchParams.get('code');
  const state = event.url.searchParams.get('state');
  if (!code || !state) {
    event.locals.logger.error(
      {
        hasCode: !!code,
        hasState: !!state,
      },
      'Google OAuth2 callback failed: Missing required parameters from URL',
    );
    return redirect(302, '/login?error=oauth2_callback_failed');
  }

  const codeVerifier = event.locals.session.get<string>('codeVerifier');
  const authURL = event.locals.session.get<string>('authURL');
  if (!codeVerifier || !authURL) {
    event.locals.logger.error(
      {
        hasCodeVerifier: !!codeVerifier,
        hasAuthURL: !!authURL,
      },
      'Google OAuth2 callback failed: Missing required parameters from session',
    );
    return redirect(302, '/login?error=oauth2_callback_failed');
  }

  const originalState = new URL(authURL).searchParams.get('state');
  if (!originalState || originalState !== state) {
    event.locals.logger.error(
      {
        originalState,
        callbackState: state,
      },
      'Google OAuth2 callback failed: Mismatch between original and callback state',
    );
    return redirect(302, '/login?error=oauth2_callback_failed');
  }

  const idToken = await exchangeGoogleCodeForIdToken({
    origin: event.url.origin,
    code,
    codeVerifier,
  });
  if (!idToken) {
    event.locals.logger.error('Google OAuth2 callback failed: Missing ID token');
    return redirect(302, '/login?error=oauth2_callback_failed');
  }

  const profile = await verifyGoogleIdToken(idToken);
  if (!profile) {
    event.locals.logger.error('Google OAuth2 callback failed: Invalid ID token');
    return redirect(302, '/login?error=oauth2_callback_failed');
  }

  let user = await db.user.findUnique({
    where: {
      email: profile.email,
    },
  });

  if (!user) {
    try {
      user = await db.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          googleProviderId: profile.id,
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        event.locals.logger.error(
          { email: profile.email },
          'Google OAuth2 callback failed: User creation failed due to duplicate constraint',
        );
        return redirect(302, '/login?error=oauth2_callback_failed');
      }

      event.locals.logger.error(
        err,
        'Google OAuth2 callback failed: Unknown error occurred while creating user',
      );
      return redirect(302, '/login?error=oauth2_callback_failed');
    }
  }

  try {
    await auth.signIn(event, {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    event.locals.logger.error(
      err,
      'Google OAuth2 callback failed: Unknown error occurred while signing in user',
    );
    return redirect(302, '/login?error=oauth2_callback_failed');
  }

  const rawState = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
  const returnTo = rawState['return_to'] || '/';

  return redirect(302, returnTo);
};
