import { redirect } from '@sveltejs/kit';

import { auth, exchangeGoogleCodeForIdToken, verifyGoogleIdToken } from '$lib/server/auth.js';
import { db, PrismaClientKnownRequestError } from '$lib/server/db.js';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'google_oauth2_callback' });

  const code = event.url.searchParams.get('code');
  const state = event.url.searchParams.get('state');
  if (!code || !state) {
    logger.error(
      {
        hasCode: !!code,
        hasState: !!state,
      },
      'Missing required parameters from URL',
    );
    return redirect(302, '/login?error=oauth2_callback_failed');
  }

  const codeVerifier = event.locals.session.get<string>('codeVerifier');
  const authURL = event.locals.session.get<string>('authURL');
  if (!codeVerifier || !authURL) {
    logger.error(
      {
        hasCodeVerifier: !!codeVerifier,
        hasAuthURL: !!authURL,
      },
      'Missing required parameters from session',
    );
    return redirect(302, '/login?error=oauth2_callback_failed');
  }

  const originalState = new URL(authURL).searchParams.get('state');
  if (!originalState || originalState !== state) {
    logger.error(
      {
        originalState,
        callbackState: state,
      },
      'Mismatch between original and callback state',
    );
    return redirect(302, '/login?error=oauth2_callback_failed');
  }

  const idToken = await exchangeGoogleCodeForIdToken({
    origin: event.url.origin,
    code,
    codeVerifier,
  });
  if (!idToken) {
    logger.error('Missing ID token');
    return redirect(302, '/login?error=oauth2_callback_failed');
  }

  const profile = await verifyGoogleIdToken(idToken);
  if (!profile) {
    logger.error('Invalid ID token');
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
          avatarURL: profile.picture,
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        logger.error({ email: profile.email }, 'User creation failed due to duplicate constraint');
        return redirect(302, '/login?error=oauth2_callback_failed');
      }

      logger.error(err, 'Unknown error occurred while creating user');
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
    logger.error(err, 'Unknown error occurred while signing in user');
    return redirect(302, '/login?error=oauth2_callback_failed');
  }

  const rawState = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
  const returnTo = rawState['return_to'] || '/';

  logger.info({ email: user.email }, 'Successfully signed in user');

  return redirect(302, returnTo);
};
