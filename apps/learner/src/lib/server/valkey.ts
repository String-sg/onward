import process from 'node:process';

import { GlideClient } from '@valkey/valkey-glide';

import { env } from '$env/dynamic/private';

const url = new URL(env.VALKEY_URL || 'valkey://default:secret@localhost:6379/0');

export const valkey = await GlideClient.createClient({
  addresses: [
    {
      host: url.hostname,
      port: Number(url.port) || 6379,
    },
  ],
  credentials: {
    username: url.username,
    password: url.password,
  },
  databaseId: Number(url.pathname.slice(1)) || 0,

  // Enable TLS if the query string contains `tls=true`.
  useTLS: url.searchParams.get('tls') === 'true',
});

// Close the connection to the Valkey instance when the server shuts down.
process.on('sveltekit:shutdown', () => {
  valkey.close();
});
