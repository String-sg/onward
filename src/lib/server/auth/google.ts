import { createHash } from 'node:crypto';

import { CodeChallengeMethod, OAuth2Client } from 'google-auth-library';

import { env } from '$env/dynamic/private';

export interface GoogleProfile {
  /**
   * A unique identifier of the Google profile.
   */
  id: string;
  /**
   * The email of the Google profile.
   */
  email: string;
  /**
   * The name of the Google profile.
   */
  name: string;
  /**
   * A URL to the picture of the Google profile.
   */
  picture: string;
}

/**
 * The path where Google will redirect after a successful authentication.
 */
const GOOGLE_REDIRECT_URL_PATH = '/auth/google/callback';

function getOAuth2Client() {
  return new OAuth2Client({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
  });
}

/**
 * Generates a Google OAuth2 authorization URL for initiating the authentication flow.
 *
 * @param options.origin - The origin of the application. It is used to construct the redirect URI.
 * @param options.state - A random string to prevent CSRF attacks.
 * @param options.codeVerifier - A cryptographically random string used for PKCE verification.
 * @param options.prompt - A space-delimited list of prompts for authentication.
 * @returns The complete Google OAuth2 authorization URL.
 *
 * @example
 * ```ts
 * const authURL = generateAuthURL({
 *   origin: "https://myapp.com",
 *   state: "random-state-string",
 *   codeVerifier: "random-code-verifier"
 * });
 * // Returns: "https://accounts.google.com/oauth/authorize?..."
 * ```
 */
export function generateAuthURL({
  origin,
  state,
  codeVerifier,
  prompt,
}: {
  origin: string;
  state: string;
  codeVerifier: string;
  prompt?: string;
}): string {
  const client = getOAuth2Client();

  return client.generateAuthUrl({
    redirect_uri: origin + GOOGLE_REDIRECT_URL_PATH,
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    state,
    code_challenge: createHash('sha256').update(codeVerifier).digest('base64url'),
    code_challenge_method: CodeChallengeMethod.S256,
    hd: env.GOOGLE_HOSTED_DOMAIN,
    prompt,
  });
}

/**
 * Exchanges the Google OAuth2 authorization code for a Google ID token.
 *
 * @param options.origin - The origin of the application. It is used to construct the redirect URI.
 * @param options.code - The authorization code received from Google's callback.
 * @param options.codeVerifier - The same code verifier used in `generateGoogleAuthURL` for PKCE verification.
 * @returns The Google ID token or `null` if ID token is missing.
 *
 * @example
 * ```ts
 * const idToken = await exchangeCodeForIdToken({
 *   origin: "https://myapp.com",
 *   code: "authorization-code-from-google",
 *   codeVerifier: "code-verifier"
 * });
 * ```
 */
export async function exchangeCodeForIdToken({
  origin,
  code,
  codeVerifier,
}: {
  origin: string;
  code: string;
  codeVerifier: string;
}): Promise<string | null> {
  const client = getOAuth2Client();

  const { tokens } = await client.getToken({
    redirect_uri: origin + GOOGLE_REDIRECT_URL_PATH,
    code,
    codeVerifier,
  });

  const idToken = tokens.id_token;
  if (!idToken) {
    return null;
  }

  return idToken;
}

/**
 * Verifies the Google ID token and extracts the profile information from the
 * Google OAuth2 ID token.
 *
 * @param idToken - The Google ID token to verify.
 * @returns The Google profile or `null` if the ID token is invalid.
 *
 * @example
 * ```ts
 * const profile = await verifyIdToken(idToken);
 * ```
 */
export async function verifyIdToken(idToken: string): Promise<GoogleProfile | null> {
  const client = getOAuth2Client();

  const ticket = await client.verifyIdToken({ idToken });

  const payload = ticket.getPayload();
  if (!payload || !payload.sub || !payload.email || !payload.name || !payload.picture) {
    return null;
  }

  // If the Google hosted domain is set, make sure the `hd` claim matches the hosted domain.
  if (env.GOOGLE_HOSTED_DOMAIN && payload.hd !== env.GOOGLE_HOSTED_DOMAIN) {
    return null;
  }

  return {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}
