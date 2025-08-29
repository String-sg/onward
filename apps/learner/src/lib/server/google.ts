import { type GlideClient, TimeUnit } from '@valkey/valkey-glide';
import { CodeChallengeMethod, OAuth2Client } from 'google-auth-library';

import { env } from '$env/dynamic/private';

import { generateCodeChallenge, generateCodeVerifier } from '../helpers/pkce';
import { valkey } from './valkey';

interface GoogleOAuthOptions {
  valkey: GlideClient;
  clientId: string;
  redirectUri: string;
}

interface CallbackOptions {
  code: string;
  state: string;
}

export class GoogleOAuth {
  private valkey: GlideClient;
  private readonly clientId: string;
  private readonly redirectUri: string;

  constructor(options: GoogleOAuthOptions) {
    this.valkey = options.valkey;
    this.clientId = options.clientId;
    this.redirectUri = options.redirectUri;
  }

  private client(clientSecret?: string): OAuth2Client {
    return getOAuthClient(this.clientId, clientSecret, this.redirectUri);
  }

  /**
   * Create an authentication URL for Google OAuth
   * @param session The user's session
   * @returns The authentication URL
   */
  async createAuthUrl(session: App.Locals['session']): Promise<string> {
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // Get CSRF token from session
    const csrfToken = session.csrfToken();

    // Create OAuth URL with PKCE
    const authUrl = this.client().generateAuthUrl({
      scope: ['email', 'profile'],
      client_id: this.clientId,
      response_type: 'code',
      prompt: 'consent',
      access_type: 'offline',
      state: csrfToken,
      redirect_uri: this.redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: CodeChallengeMethod.S256,
      hd: env.GOOGLE_HOSTED_DOMAIN,
    });

    // Store auth state and pkce verifier in Valkey
    await this.valkey.set(`oauth:google:verifier:${session.id}`, codeVerifier, {
      expiry: { type: TimeUnit.Seconds, count: 300 },
    });
    await this.valkey.set(`oauth:google:authUrl:${session.id}`, authUrl, {
      expiry: { type: TimeUnit.Seconds, count: 300 },
    });

    return authUrl.toString();
  }

  /**
   * Handle the callback from Google OAuth
   * @param session The user's session
   * @param options The callback options
   */
  async handleCallback(session: App.Locals['session'], options: CallbackOptions): Promise<void> {
    const { code, state } = options;

    // Verify state parameter matches stored CSRF token
    const storedAuthUrl = await this.valkey.get(`oauth:google:authUrl:${session.id}`);

    if (!storedAuthUrl) {
      throw new Error('Auth URL not found');
    }

    const storedState = new URL(storedAuthUrl.toString()).searchParams.get('state');
    if (storedState !== state) {
      throw new Error('Invalid state parameter');
    }

    // Get code verifier from Valkey
    const codeVerifier = await this.valkey.get(`oauth:google:verifier:${session.id}`);
    if (!codeVerifier) {
      throw new Error('Code verifier not found');
    }

    // Exchange code for tokens

    await this.client(env.GOOGLE_CLIENT_SECRET ?? '').getToken({
      code,
      codeVerifier: codeVerifier.toString(),
      redirect_uri: this.redirectUri,
    });

    //TODO: Set @tokens into auth session once retrieved above

    // Clean up Valkey entries
    await this.valkey.del([`oauth:google:verifier:${session.id}`]);
    await this.valkey.del([`oauth:google:authUrl:${session.id}`]);
  }
}

function getOAuthClient(
  clientId: string,
  clientSecret: string | undefined,
  redirectUri: string,
): OAuth2Client {
  return new OAuth2Client({ clientId, clientSecret, redirectUri });
}

// Export an instance of GoogleOAuth
export const google = new GoogleOAuth({
  valkey,
  clientId: env.GOOGLE_CLIENT_ID ?? '',
  redirectUri: env.GOOGLE_REDIRECT_URI ?? '',
});
