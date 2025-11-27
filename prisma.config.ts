import 'dotenv/config';

import type { PrismaConfig } from 'prisma';

export default {
  datasource: {
    url: process.env.POSTGRES_URL || 'postgresql://root:secret@localhost:5432/onward-dev',
  },
} satisfies PrismaConfig;
