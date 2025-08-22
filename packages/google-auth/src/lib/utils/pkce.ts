import { createHash, randomBytes } from 'node:crypto';

/**
 * Base64url encodes a buffer (RFC 4648, no padding).
 */
export function base64url(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * Generates a 32 bytes PKCE code verifier
 */
export function generateCodeVerifier(): string {
  return base64url(randomBytes(32));
}

/**
 * Generates a PKCE code challenge (S256) from a code verifier.
 */
export function generateCodeChallenge(verifier: string): string {
  return base64url(createHash('sha256').update(verifier).digest());
}

/**
 * Builds a namespaced PKCE storage key for Valkey.
 * Namespacing with sessionId and state allows multiple concurrent OAuth attempts per session.
 */
export function buildPkceKey(sessionId: string, state: string, namespace = 'oauth:pkce'): string {
  return `${namespace}:${sessionId}:${state}`;
}
