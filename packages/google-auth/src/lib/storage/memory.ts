import { type OAuthStorage } from './interface';

/**
 * In-memory implementation of OAuthStorage
 * Useful for testing or environments where Redis is not available
 */
export class MemoryStorage implements OAuthStorage {
  private storage = new Map<string, { value: string; expiresAt: number }>();

  async store(key: string, value: string, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.storage.set(key, { value, expiresAt });

    // Set up expiration
    setTimeout(() => {
      this.storage.delete(key);
    }, ttlSeconds * 1000);
  }

  async readAndDelete(key: string): Promise<string | null> {
    const entry = this.storage.get(key);
    this.storage.delete(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      return null;
    }

    return entry.value;
  }
}
