import crypto from 'node:crypto';

/**
 * Generate a code verifier for PKCE
 * @returns A random string of 43-128 characters
 */
export function generateCodeVerifier(): string {
  return crypto.randomBytes(64).toString('base64url');
}

/**
 * Generate a code challenge from a code verifier using S256 method
 * @param verifier The code verifier
 * @returns The code challenge
 */
export function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return hash.toString('base64url');
}
