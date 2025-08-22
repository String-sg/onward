import { type GlideClient, TimeUnit } from '@valkey/valkey-glide';

import { type OAuthStorage } from './interface';

/**
 * Valkey implementation of OAuthStorage with error handling
 */
export class ValkeyStorage implements OAuthStorage {
  constructor(private readonly client: GlideClient) {}

  async store(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, value, { expiry: { type: TimeUnit.Seconds, count: ttlSeconds } });
    } catch (error) {
      // Log error but don't throw during build time
      console.warn('Failed to store value in Valkey:', error);
    }
  }

  async readAndDelete(key: string): Promise<string | null> {
    try {
      const buf = await this.client.get(key);
      try {
        await this.client.del([key]);
      } catch {
        // Ignore deletion errors
      }
      return buf ? buf.toString() : null;
    } catch (error) {
      // Log error but don't throw during build time
      console.warn('Failed to read/delete value from Valkey:', error);
      return null;
    }
  }
}
