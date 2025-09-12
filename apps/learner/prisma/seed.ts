import * as dotenv from 'dotenv';

import { type Prisma, PrismaClient } from '../src/generated/client.js';

dotenv.config({ path: '../.env' });

enum ContentType {
  Podcast = 'podcast',
}

const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_URL || 'postgresql://root:secret@localhost:5432/onward-dev',
    },
  },
});

const collections = [
  {
    id: 1,
    data: {
      title: 'SEN Peer Support',
      tag: 'Special Educational Needs',
    },
  },
  {
    id: 2,
    data: {
      title: 'Learn to use AI',
      tag: 'Artificial Intelligence',
    },
  },
  {
    id: 3,
    data: {
      title: 'Understanding Mental Health',
      tag: 'Teacher mental health literacy',
    },
  },
];

//TODO: update content URL after seedbox is up
const learningUnits = [
  {
    id: 1,
    data: {
      title: 'SEN Learning Unit 1',
      tags: ['Special Educational Needs', 'Podcast'],
      contentType: ContentType.Podcast,
      contentURL: 'https://example.com',
      collectionId: 1,
      summary: 'This is a summary',
    },
  },
  {
    id: 2,
    data: {
      title: 'SEN Learning Unit 2',
      tags: ['Special Educational Needs', 'Podcast'],
      contentType: ContentType.Podcast,
      contentURL: 'https://example.com',
      collectionId: 1,
      summary: 'This is a summary',
    },
  },
  {
    id: 3,
    data: {
      title: 'AI Learning Unit 1',
      tags: ['Artificial Intelligence', 'Podcast'],
      contentType: ContentType.Podcast,
      contentURL: 'https://example.com',
      collectionId: 2,
      summary: 'This is a summary',
    },
  },
  {
    id: 4,
    data: {
      title: 'AI Learning Unit 2',
      tags: ['Artificial Intelligence', 'Podcast'],
      contentType: ContentType.Podcast,
      contentURL: 'https://example.com',
      collectionId: 2,
      summary: 'This is a summary',
    },
  },
];

async function main() {
  for (const collection of collections) {
    await createCollection(collection);
  }

  for (const learningUnit of learningUnits) {
    await createLearningUnit(learningUnit);
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

async function createCollection(collection: { id: number; data: Prisma.CollectionCreateInput }) {
  return db.collection.upsert({
    where: { id: collection.id },
    update: {},
    create: collection.data,
  });
}

async function createLearningUnit(learningUnit: {
  id: number;
  data: Prisma.LearningUnitUncheckedCreateInput;
}) {
  return db.learningUnit.upsert({
    where: { id: learningUnit.id },
    update: {},
    create: learningUnit.data,
  });
}
