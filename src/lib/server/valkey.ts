import process from 'node:process';

import { GlideClient } from '@valkey/valkey-glide';

import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

const url = new URL(env.VALKEY_URL || 'valkey://default:secret@localhost:6379/0');

export const valkey = await GlideClient.createClient({
  credentials: {
    username: url.username,
    password: url.password,
  },
  addresses: [
    {
      host: url.hostname,
      port: Number(url.port) || 6379,
    },
  ],
  databaseId: Number(url.pathname.slice(1)) || 0,
  useTLS: url.searchParams.get('tls') === 'true',

  // Prevent establishing connection during build time.
  lazyConnect: true,
});

if (!building) {
  const isReady = await valkey
    .ping()
    .then(() => true)
    .catch(() => false);

  if (!isReady) {
    valkey.close();
    throw new Error('Valkey is not ready.');
  }
}

// Close the connection to the Valkey instance when the server shuts down.
process.on('sveltekit:shutdown', () => {
  valkey.close();
});
