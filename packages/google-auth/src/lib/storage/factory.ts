import { type GlideClient } from '@valkey/valkey-glide';

import { type OAuthStorage } from './interface';
import { MemoryStorage } from './memory';
import { ValkeyStorage } from './valkey';

/**
 * Creates the appropriate storage implementation based on the environment
 */
export function createStorage(options: {
  valkey?: GlideClient;
  useMemoryStorage?: boolean;
}): OAuthStorage {
  const { valkey, useMemoryStorage } = options;

  // Use memory storage if explicitly requested or if no Valkey client provided
  if (useMemoryStorage || !valkey) {
    return new MemoryStorage();
  }

  // Otherwise use Valkey storage
  return new ValkeyStorage(valkey);
}
