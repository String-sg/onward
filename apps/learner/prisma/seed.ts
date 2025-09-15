import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { ContentType, type Prisma, PrismaClient } from '../src/generated/prisma/client.js';

const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.POSTGRES_URL || 'postgresql://root:secret@localhost:5432/onward-dev',
  }),
});

const tags: Prisma.TagCreateInput[] = [
  {
    id: 1,
    name: 'Special Educational Needs',
  },
  {
    id: 2,
    name: 'Artificial Intelligence',
  },
];

const collections: Prisma.CollectionCreateInput[] = [
  {
    id: 1,
    title: 'SEN Peer Support',
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[0].id,
            },
          },
        },
      ],
    },
  },
  {
    id: 2,
    title: 'Learn to use AI',
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[1].id,
            },
          },
        },
      ],
    },
  },
];

const learningUnits: Prisma.LearningUnitCreateInput[] = [
  {
    id: 1,
    title: 'SEN Learning Unit 1',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    collection: {
      connect: {
        id: collections[0].id,
      },
    },
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[0].id,
            },
          },
        },
      ],
    },
  },
  {
    id: 2,
    title: 'SEN Learning Unit 2',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    collection: {
      connect: {
        id: collections[0].id,
      },
    },
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[0].id,
            },
          },
        },
      ],
    },
  },
  {
    id: 3,
    title: 'AI Learning Unit 1',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    collection: {
      connect: {
        id: collections[1].id,
      },
    },
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[1].id,
            },
          },
        },
      ],
    },
  },
  {
    id: 4,
    title: 'AI Learning Unit 2',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    collection: {
      connect: {
        id: collections[1].id,
      },
    },
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[1].id,
            },
          },
        },
      ],
    },
  },
];

async function main() {
  for (const tag of tags) {
    await db.tag.upsert({
      where: { id: tag.id },
      update: {},
      create: tag,
    });
  }

  for (const collection of collections) {
    await db.collection.upsert({
      where: { id: collection.id },
      update: {},
      create: collection,
    });
  }

  for (const learningUnit of learningUnits) {
    await db.learningUnit.upsert({
      where: { id: learningUnit.id },
      update: {},
      create: learningUnit,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
