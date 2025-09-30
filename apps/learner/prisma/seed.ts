import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import {
  CollectionType,
  ContentType,
  type Prisma,
  PrismaClient,
} from '../src/generated/prisma/client.js';

const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString:
      process.env.POSTGRES_URL || 'postgresql://root:secret@localhost:5432/onward-dev',
  }),
});

const tags: Prisma.TagCreateInput[] = [
  {
    id: 1,
    code: 'SEN',
    label: 'Special Educational Needs',
  },
  {
    id: 2,
    code: 'AI',
    label: 'Artificial Intelligence',
  },
];

const collections: Prisma.CollectionCreateInput[] = [
  {
    id: 1,
    title: 'SEN Peer Support',
    description:
      'Explore the world of Special Educational Needs (SEN) peer support that indicates Singapore specific peer support knowledge, case studies and more to gain knowledge about SEN.',
    type: CollectionType.SEN,
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
    description:
      'Discover how AI is transforming education through personalized learning, intelligent tutoring systems, and data-driven insights to enhance teaching effectiveness.',
    type: CollectionType.AI,
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

const questionAnswers: Prisma.QuestionAnswerCreateManyLearningUnitInput[] = [
  {
    question: 'What is the color of the sky?',
    options: ['Blue', 'Red', 'Green', 'Yellow'],
    answer: 0,
    explanation: 'Blue is the best colour!',
    order: 0,
  },
  {
    question:
      'This is a super long question that is going to wrap around to the next line and then some more text to see how it looks. It should be long enough to wrap around to the next line and then some more text to see how it looks. I want to see how it looks when it wraps around to the next line and then some more text to see how it looks.',
    options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    answer: 1,
    explanation:
      'This is an explanation. It is a very long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long explanation.',
    order: 1,
  },
  {
    question: 'How many days are in a week?',
    options: ['7', '8', '9', '10'],
    answer: 0,
    explanation: 'There are 7 days in a week.',
    order: 2,
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
    createdBy: 'DXD Product Team',
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
    questionAnswers: {
      create: questionAnswers,
    },
  },
  {
    id: 2,
    title: 'SEN Learning Unit 2',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    createdBy: 'DXD Product Team',
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
    questionAnswers: {
      create: questionAnswers,
    },
  },
  {
    id: 3,
    title: 'AI Learning Unit 1',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    createdBy: 'DXD Product Team',
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
    questionAnswers: {
      create: questionAnswers,
    },
  },
  {
    id: 4,
    title: 'AI Learning Unit 2',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    createdBy: 'DXD Product Team',
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
    questionAnswers: {
      create: questionAnswers,
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
