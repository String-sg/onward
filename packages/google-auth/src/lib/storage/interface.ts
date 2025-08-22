/**
 * Interface for storage operations used by GoogleOAuth
 */
export interface OAuthStorage {
  /**
   * Store a value with a TTL
   */
  store(key: string, value: string, ttlSeconds: number): Promise<void>;

  /**
   * Read a value and delete it
   */
  readAndDelete(key: string): Promise<string | null>;
}
