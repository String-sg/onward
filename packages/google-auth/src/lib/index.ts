import { type GlideClient } from '@valkey/valkey-glide';
import type { Credentials } from 'google-auth-library';

import { GoogleOAuth } from './google';
import { createStorage } from './storage/factory';
import type { Session } from './types';

export { GoogleOAuth } from './google';

export interface GoogleAuthOptions {
  clientId: string;
  redirectUri: string;
  scope?: string[];
  ttlSeconds?: number;
}

export interface GoogleCallbackParams {
  code: string;
  state: string;
  clientSecret?: string;
}

export interface GoogleCallbackResult {
  tokens: Credentials;
}

/**
 * Factory function for Google OAuth that uses lazy initialization
 * similar to the Auth module.
 *
 * @param valkey - The Valkey client instance
 * @param options - Configuration options
 * @returns An object with methods for Google OAuth operations
 */
export function GoogleAuth(valkey: GlideClient, options: GoogleAuthOptions) {
  // No Redis operations here, just store configuration

  return {
    /**
     * Creates an authentication URL for Google OAuth
     *
     * @param session - The user session
     * @param scope - Optional scope override
     * @returns The authentication URL
     */
    createAuthUrl: async (session: Session, scope?: string[]) => {
      // Create storage only when this method is called
      const storage = createStorage({ valkey });
      const oauth = new GoogleOAuth({
        storage,
        clientId: options.clientId,
        redirectUri: options.redirectUri,
        scope: options.scope,
        ttlSeconds: options.ttlSeconds,
      });
      return oauth.createAuthUrl(session, scope);
    },

    /**
     * Handles the OAuth callback from Google
     *
     * @param session - The user session
     * @param params - Callback parameters
     * @returns The OAuth tokens
     */
    handleCallback: async (session: Session, params: GoogleCallbackParams) => {
      const storage = createStorage({ valkey });
      const oauth = new GoogleOAuth({
        storage,
        clientId: options.clientId,
        redirectUri: options.redirectUri,
        scope: options.scope,
        ttlSeconds: options.ttlSeconds,
      });
      return oauth.handleCallback(session, params);
    },
  };
}
