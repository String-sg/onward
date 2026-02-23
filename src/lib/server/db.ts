import process from 'node:process';

import { PrismaPg } from '@prisma/adapter-pg';

import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

import { type LearningUnit, Prisma, PrismaClient } from '../../generated/prisma/client.js';

export const { PrismaClientKnownRequestError } = Prisma;
export * from '../../generated/prisma/enums.js';
export * from '../../generated/prisma/models.js';

type NullableStringKeys<T> = {
  [K in keyof T]: T[K] extends string | null ? K : never;
}[keyof T];

type PublishedLearningUnitKeys = NullableStringKeys<LearningUnit>;

/**
 * Narrows nullable string fields on a LearningUnit payload shape T to `string`.
 * Only keys present on T are narrowed; `collection` is made non-null when present.
 * Runtime guarantee comes from the `where: { status: 'PUBLISHED' }` filter in `findPublished`.
 */
export type PublishedLearningUnit<T extends object> = Omit<
  T,
  PublishedLearningUnitKeys | 'collection'
> &
  Record<PublishedLearningUnitKeys & keyof T, string> &
  ('collection' extends keyof T ? { collection: NonNullable<T['collection']> } : unknown);

const client = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: env.POSTGRES_URL || 'postgresql://root:secret@localhost:5432/onward-dev',
  }),
});

export const db = client.$extends({
  model: {
    learningUnit: {
      /**
       * `findMany` scoped to PUBLISHED units. Merges the published status filter automatically
       * and returns `PublishedLearningUnit<T>`, narrowing nullable fields to `string`.
       */
      async findPublished<const TArgs extends Prisma.LearningUnitFindManyArgs>(
        args?: TArgs,
      ): Promise<PublishedLearningUnit<Prisma.LearningUnitGetPayload<TArgs>>[]> {
        const { where, ...rest } = args ?? {};
        const result = await client.learningUnit.findMany({
          ...(rest as Prisma.LearningUnitFindManyArgs),
          where: {
            ...where,
            status: 'PUBLISHED',
            title: { not: null },
            contentURL: { not: null },
            summary: { not: null },
            objectives: { not: null },
            createdBy: { not: null },
          },
        });

        return result as unknown as PublishedLearningUnit<Prisma.LearningUnitGetPayload<TArgs>>[];
      },
    },
  },
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
