import process from 'node:process';

import { PrismaPg } from '@prisma/adapter-pg';

import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

import { Prisma, PrismaClient } from '../../generated/prisma/client.js';

export const { PrismaClientKnownRequestError } = Prisma;

export const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: env.POSTGRES_URL || 'postgresql://root:secret@localhost:5432/onward-dev',
  }),
});

if (!building) {
  const isReady = await db
    .$connect()
    .then(() => true)
    .catch(() => false);

  if (!isReady) {
    await db.$disconnect();
    throw new Error('Database is not ready.');
  }
}

// Disconnect from the database when the server shuts down.
process.on('sveltekit:shutdown', async () => {
  await db.$disconnect();
});
