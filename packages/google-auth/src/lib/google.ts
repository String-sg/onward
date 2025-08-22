import { type GlideClient } from '@valkey/valkey-glide';
import type { Credentials } from 'google-auth-library';
import { CodeChallengeMethod, OAuth2Client } from 'google-auth-library';

import { createStorage } from './storage/factory';
import { type OAuthStorage } from './storage/interface';
import type { Session } from './types';
import { buildPkceKey, generateCodeChallenge, generateCodeVerifier } from './utils/pkce';

export interface GoogleInitOptions {
  storage?: OAuthStorage;
  valkey?: GlideClient;
  session: Session;
  clientId: string;
  redirectUri: string;
  scope?: string[];
  ttlSeconds?: number; // TTL for stored state/PKCE/authUrl
  useMemoryStorage?: boolean;
}

export interface GoogleCallbackOptions {
  storage?: OAuthStorage;
  valkey?: GlideClient;
  session: Session;
  clientId: string;
  redirectUri: string;
  code: string;
  returnedState: string;
  useMemoryStorage?: boolean;
}

export interface GoogleCallbackResult {
  tokens: Credentials;
}

// -----------------------------------------------
// Internal helpers and defaults
// -----------------------------------------------

const DEFAULT_SCOPE = ['email', 'profile'] as const;
const AUTHURL_NAMESPACE = 'oauth:authurl';

function ensureConfigured(clientId?: string, redirectUri?: string): void {
  if (!clientId || !redirectUri) {
    throw new Error('Google OAuth not configured');
  }
}

function getOAuthClient(
  clientId: string,
  clientSecret: string | undefined,
  redirectUri: string,
): OAuth2Client {
  return new OAuth2Client({ clientId, clientSecret, redirectUri });
}

function buildAuthUrlKey(sessionId: string): string {
  return `${AUTHURL_NAMESPACE}:${sessionId}`;
}

function extractStateFromAuthUrl(urlString: string): string | null {
  try {
    return new URL(urlString).searchParams.get('state');
  } catch {
    return null;
  }
}

// -----------------------------------------------
// Class API
// -----------------------------------------------

export class GoogleOAuth {
  readonly #storage: OAuthStorage;
  readonly #clientId: string;
  readonly #redirectUri: string;
  #defaultScope: readonly string[];
  readonly #ttlSeconds: number;

  constructor(options: {
    storage?: OAuthStorage;
    valkey?: GlideClient;
    clientId?: string;
    redirectUri?: string;
    scope?: string[];
    ttlSeconds?: number;
    useMemoryStorage?: boolean;
  }) {
    ensureConfigured(options.clientId, options.redirectUri);

    // Use provided storage or create one based on options
    this.#storage =
      options.storage ||
      createStorage({
        valkey: options.valkey,
        useMemoryStorage: options.useMemoryStorage,
      });

    this.#clientId = options.clientId as string;
    this.#redirectUri = options.redirectUri as string;
    this.#defaultScope = options.scope ?? [...DEFAULT_SCOPE];
    this.#ttlSeconds = options.ttlSeconds ?? 300;
  }

  private client(clientSecret?: string): OAuth2Client {
    return getOAuthClient(this.#clientId, clientSecret, this.#redirectUri);
  }

  async createAuthUrl(
    session: Session,
    scope: string[] = [...this.#defaultScope],
  ): Promise<string> {
    const state = session.csrfToken();

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const pkceKey = buildPkceKey(session.id, state);
    await this.#storage.store(pkceKey, codeVerifier, this.#ttlSeconds);

    const authUrl = this.client().generateAuthUrl({
      scope,
      response_type: 'code',
      prompt: 'consent',
      access_type: 'offline',
      state,
      redirect_uri: this.#redirectUri,
      code_challenge: codeChallenge,
      code_challenge_method: CodeChallengeMethod.S256,
    });

    const urlKey = buildAuthUrlKey(session.id);
    await this.#storage.store(urlKey, authUrl, this.#ttlSeconds);

    return authUrl;
  }

  async handleCallback(
    session: Session,
    params: { code: string; state: string; clientSecret?: string },
  ): Promise<GoogleCallbackResult> {
    const { code, state, clientSecret } = params;
    if (!clientSecret) throw new Error('Google OAuth clientSecret not configured');

    const authUrlKey = buildAuthUrlKey(session.id);
    const storedAuthUrl = await this.#storage.readAndDelete(authUrlKey);
    if (!storedAuthUrl) throw new Error('Missing stored authUrl');

    const expectedState = extractStateFromAuthUrl(storedAuthUrl);
    if (!expectedState) throw new Error('Stored state missing');
    if (state !== expectedState) throw new Error('State mismatch');

    const pkceKey = buildPkceKey(session.id, state);
    const codeVerifier = await this.#storage.readAndDelete(pkceKey);
    if (!codeVerifier) throw new Error('Missing PKCE verifier');

    const { tokens } = await this.client(clientSecret).getToken({
      code,
      codeVerifier,
      redirect_uri: this.#redirectUri,
    });
    return { tokens };
  }
}
