import process from 'node:process';

import { env } from '$env/dynamic/private';

import { PrismaClient } from '../../generated/client.js';

export const db = new PrismaClient({
  datasources: {
    db: {
      url: env.POSTGRES_URL || 'postgresql://root:secret@localhost:5432/onward-dev',
    },
  },
});

// Disconnect from the database when the server shuts down.
process.on('sveltekit:shutdown', async () => {
  await db.$disconnect();
});
