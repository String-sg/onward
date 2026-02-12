import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { v7 as uuidv7 } from 'uuid';

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
    id: uuidv7(),
    code: 'STU_DEV',
    label: 'Student Development',
  },
  {
    id: uuidv7(),
    code: 'AI',
    label: 'Artificial Intelligence',
  },
  {
    id: uuidv7(),
    code: 'INFRA',
    label: 'Infrastructure',
  },
  {
    id: uuidv7(),
    code: 'WELLBEING',
    label: 'Wellbeing',
  },
  {
    id: uuidv7(),
    code: 'EDU_VOICES',
    label: 'Educator Voices',
  },
  {
    id: uuidv7(),
    code: 'EMP_ENGAGEMENT',
    label: 'Employee Engagement',
  },
  {
    id: uuidv7(),
    code: 'PDF',
    label: 'PDF',
  },
  {
    id: uuidv7(),
    code: 'LINK',
    label: 'Link',
  },
];

const collections: Prisma.CollectionCreateInput[] = [
  {
    id: uuidv7(),
    title: 'SEN Peer Support',
    description:
      'Explore the world of Special Educational Needs (SEN) peer support that indicates Singapore specific peer support knowledge, case studies and more to gain knowledge about SEN.',
    type: CollectionType.STU_DEV,
  },
  {
    id: uuidv7(),
    title: 'Learn to use AI',
    description:
      'Discover how AI is transforming education through personalized learning, intelligent tutoring systems, and data-driven insights to enhance teaching effectiveness.',
    type: CollectionType.AI,
  },
  {
    id: uuidv7(),
    title: 'Infrastructure for Education',
    description: 'Lorem Ipsum 1',
    type: CollectionType.INFRA,
  },
  {
    id: uuidv7(),
    title: 'Wellbeing 1',
    description: 'Loren Ipsum 2',
    type: CollectionType.WELLBEING,
  },
  {
    id: uuidv7(),
    title: 'Educator Voices',
    description: 'Loren Ipsum 3',
    type: CollectionType.EDU_VOICES,
  },
  {
    id: uuidv7(),
    title: 'Engagement',
    description: 'Loren Ipsum 4',
    type: CollectionType.EMP_ENGAGEMENT,
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

const objectives = `
### Objectives
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Nullam ac erat ante. Proin sit amet turpis nec nisl efficitur dignissim. Integer a sapien eget sapien tincidunt aliquet. Curabitur non massa nec urna vulputate facilisis. Fusce ut lectus non nulla gravida volutpat.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Nullam ac erat ante. Proin sit amet turpis nec nisl efficitur dignissim. Integer a sapien eget sapien tincidunt aliquet. Curabitur non massa nec urna vulputate facilisis. Fusce ut lectus non nulla gravida volutpat.

- **Lorem** ipsum dolor sit amet, consectetur adipiscing elit.
- **Sed** do eiusmod tempor incididunt ut labore et dolore magna aliqua.
- **Ut enim** ad minim veniam, quis nostrud exercitation ullamco laboris.
`;
const summary = `
### Summary
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Nullam ac erat ante. Proin sit amet turpis nec nisl efficitur dignissim. Integer a sapien eget sapien tincidunt aliquet. Curabitur non massa nec urna vulputate facilisis. Fusce ut lectus non nulla gravida volutpat.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Nullam ac erat ante. Proin sit amet turpis nec nisl efficitur dignissim. Integer a sapien eget sapien tincidunt aliquet. Curabitur non massa nec urna vulputate facilisis. Fusce ut lectus non nulla gravida volutpat.

- **Lorem** ipsum dolor sit amet, consectetur adipiscing elit.
- **Sed** do eiusmod tempor incididunt ut labore et dolore magna aliqua.
- **Ut enim** ad minim veniam, quis nostrud exercitation ullamco laboris.
`;

const learningUnits: Prisma.LearningUnitCreateInput[] = [
  {
    id: uuidv7(),
    title: 'SEN Learning Unit 1',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary,
    objectives,
    createdBy: 'DXD Product Team',
    isRequired: true,
    dueDate: new Date('2026-02-12'), // Required
    collections: {
      create: {
        collection: {
          connect: {
            id: collections[0].id,
          },
        },
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
    id: uuidv7(),
    title: 'SEN Learning Unit 2',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary,
    objectives,
    createdBy: 'DXD Product Team',
    isRequired: true,
    dueDate: new Date('2025-11-01'), // Overdue
    collections: {
      create: {
        collection: {
          connect: {
            id: collections[0].id,
          },
        },
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
    id: uuidv7(),
    title: 'AI Learning Unit 1',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary,
    objectives,
    createdBy: 'DXD Product Team',
    isRequired: false, // Not required
    collections: {
      create: {
        collection: {
          connect: {
            id: collections[1].id,
          },
        },
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
    id: uuidv7(),
    title: 'AI Learning Unit 2',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary,
    objectives,
    createdBy: 'DXD Product Team',
    isRequired: true,
    dueDate: new Date('2025-11-20'), // Overdue
    collections: {
      create: {
        collection: {
          connect: {
            id: collections[1].id,
          },
        },
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
    id: uuidv7(),
    title: 'Infra Learning Unit 1',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary,
    objectives,
    createdBy: 'DXD Product Team',
    isRequired: true,
    dueDate: new Date('2026-02-12'), // Required
    collections: {
      create: {
        collection: {
          connect: {
            id: collections[2].id,
          },
        },
      },
    },
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[2].id,
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
    id: uuidv7(),
    title: 'Wellbeing Learning Unit 1',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary,
    objectives,
    createdBy: 'DXD Product Team',
    isRequired: true,
    dueDate: new Date('2026-02-12'), // Required
    collections: {
      create: {
        collection: {
          connect: {
            id: collections[3].id,
          },
        },
      },
    },
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[3].id,
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
    id: uuidv7(),
    title: 'Educator Voices Learning Unit 1',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary,
    objectives,
    createdBy: 'DXD Product Team',
    isRequired: true,
    dueDate: new Date('2026-02-12'), // Required
    collections: {
      create: {
        collection: {
          connect: {
            id: collections[4].id,
          },
        },
      },
    },
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[4].id,
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
    id: uuidv7(),
    title: 'Employee Engagement Learning Unit 1',
    contentType: ContentType.PODCAST,
    contentURL: 'http://localhost:5173',
    summary,
    objectives,
    createdBy: 'DXD Product Team',
    isRequired: true,
    dueDate: new Date('2026-02-12'), // Required
    collections: {
      create: {
        collection: {
          connect: {
            id: collections[5].id,
          },
        },
      },
    },
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[5].id,
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

const learningUnitSources: Prisma.LearningUnitSourcesCreateInput[] = [
  {
    id: uuidv7(),
    title: 'Learning Resource 1',
    learningUnit: {
      connect: {
        id: learningUnits[0].id,
      },
    },
    sourceURL: 'http://localhost:5173',
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[6].id,
            },
          },
        },
      ],
    },
  },
  {
    id: uuidv7(),
    title: 'Learning Resource 2',
    learningUnit: {
      connect: {
        id: learningUnits[1].id,
      },
    },
    sourceURL: 'http://localhost:5173',
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[7].id,
            },
          },
        },
      ],
    },
  },
  {
    id: uuidv7(),
    title: 'Learning Resource 3',
    learningUnit: {
      connect: {
        id: learningUnits[2].id,
      },
    },
    sourceURL: 'http://localhost:5173',
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[6].id,
            },
          },
        },
      ],
    },
  },
  {
    id: uuidv7(),
    title: 'Learning Resource 4',
    learningUnit: {
      connect: {
        id: learningUnits[3].id,
      },
    },
    sourceURL: 'http://localhost:5173',
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[7].id,
            },
          },
        },
      ],
    },
  },
  {
    id: uuidv7(),
    title: 'Learning Resource 5',
    learningUnit: {
      connect: {
        id: learningUnits[0].id,
      },
    },
    sourceURL: 'http://localhost:5173',
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[6].id,
            },
          },
        },
      ],
    },
  },
  {
    id: uuidv7(),
    title: 'Learning Resource 6',
    learningUnit: {
      connect: {
        id: learningUnits[1].id,
      },
    },
    sourceURL: 'http://localhost:5173',
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[7].id,
            },
          },
        },
      ],
    },
  },
  {
    id: uuidv7(),
    title: 'Learning Resource 7',
    learningUnit: {
      connect: {
        id: learningUnits[2].id,
      },
    },
    sourceURL: 'http://localhost:5173',
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[6].id,
            },
          },
        },
      ],
    },
  },
  {
    id: uuidv7(),
    title: 'Learning Resource 8',
    learningUnit: {
      connect: {
        id: learningUnits[3].id,
      },
    },
    sourceURL: 'http://localhost:5173',
    tags: {
      create: [
        {
          tag: {
            connect: {
              id: tags[7].id,
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

  for (const source of learningUnitSources) {
    await db.learningUnitSources.upsert({
      where: { id: source.id },
      update: {},
      create: source,
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
