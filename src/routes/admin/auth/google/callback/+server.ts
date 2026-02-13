import { redirect } from '@sveltejs/kit';

import {
  adminAuth,
  exchangeCodeForIdToken,
  type GoogleProfile,
  verifyIdToken,
} from '$lib/server/auth/index.js';
import {
  db,
  PrismaClientKnownRequestError,
  type UserAdminFindUniqueArgs,
  type UserAdminGetPayload,
} from '$lib/server/db.js';

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
      'Missing required OAuth2 parameters from URL',
    );
    return redirect(302, '/admin?error=session_expired');
  }

  const codeVerifier = event.locals.session.get<string>('adminCodeVerifier');
  const authURL = event.locals.session.get<string>('adminAuthURL');
  if (!codeVerifier || !authURL) {
    logger.error(
      {
        hasCodeVerifier: !!codeVerifier,
        hasAuthURL: !!authURL,
      },
      'Missing required values from session',
    );
    return redirect(302, '/admin?error=session_expired');
  }

  const originalState = new URL(authURL).searchParams.get('state');
  if (!originalState || originalState !== state) {
    logger.error('State mismatch between original and callback');
    return redirect(302, '/admin?error=auth_failed');
  }

  let idToken: string | null = null;
  try {
    idToken = await exchangeCodeForIdToken({
      origin: `${event.url.origin}/admin`,
      code,
      codeVerifier,
    });

    if (!idToken) {
      logger.error('Missing ID token');
      return redirect(302, '/admin?error=auth_failed');
    }
  } catch (err) {
    logger.error(err, 'Failed to exchange code for ID token');
    return redirect(302, '/admin?error=auth_failed');
  }

  let profile: GoogleProfile | null = null;
  try {
    profile = await verifyIdToken(idToken);

    if (!profile) {
      logger.error('Invalid Google profile');
      return redirect(302, '/admin?error=auth_failed');
    }
  } catch (err) {
    logger.error(err, 'Failed to verify ID token');
    return redirect(302, '/admin?error=auth_failed');
  }

  // Look up admin in user_admins table
  const userAdminArgs = {
    select: {
      id: true,
      email: true,
      name: true,
      googleProviderId: true,
      isActive: true,
    },
    where: {
      email: profile.email,
    },
  } satisfies UserAdminFindUniqueArgs;

  let userAdmin: UserAdminGetPayload<typeof userAdminArgs>;
  try {
    userAdmin = await db.userAdmin.findUniqueOrThrow(userAdminArgs);
  } catch (err) {
    logger.error({ err, email: profile.email }, 'Failed to look up admin user');
    return redirect(302, '/admin?error=server_error');
  }

  if (!userAdmin) {
    logger.warn({ email: profile.email }, 'Failure to find admin');
    return redirect(302, '/admin?error=unauthorized');
  }

  if (!userAdmin.isActive) {
    logger.warn({ email: profile.email, id: userAdmin.id }, 'Inactive Admin is trying to log in');
    return redirect(302, '/admin?error=inactive');
  }

  if (userAdmin.googleProviderId === null) {
    logger.info(
      { adminId: userAdmin.id, email: profile.email },
      'First login, setting ID and name from google profile',
    );

    try {
      userAdmin = await db.userAdmin.update({
        where: { id: userAdmin.id },
        data: {
          name: profile.name,
          googleProviderId: profile.id,
        },
        select: {
          id: true,
          email: true,
          name: true,
          googleProviderId: true,
          isActive: true,
        },
      });
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
        logger.error({ err, email: profile.email }, 'googleProviderId already exists');
        return redirect(302, '/admin?error=server_error');
      }

      logger.error({ err, email: profile.email }, 'Failed to update admin user');
      return redirect(302, '/admin?error=server_error');
    }
  } else {
    try {
      userAdmin = await db.userAdmin.update({
        where: { id: userAdmin.id },
        data: {
          name: profile.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          googleProviderId: true,
          isActive: true,
        },
      });
    } catch (err) {
      logger.error({ err, email: profile.email }, 'Failure to get/update admin');
      return redirect(302, '/admin?error=server_error');
    }
  }

  try {
    await adminAuth.signIn(event, {
      id: userAdmin.id,
      email: userAdmin.email,
      name: userAdmin.name || '',
      isActive: userAdmin.isActive,
    });
  } catch (err) {
    logger.error({ err, email: userAdmin.email }, 'Failed to sign in user');
    return redirect(302, '/admin?error=server_error');
  }

  const rawState = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
  const returnTo = rawState['return_to'] || '/admin/dashboard';

  logger.info({ email: userAdmin.email }, 'Successfully signed in admin');

  return redirect(302, returnTo);
};
