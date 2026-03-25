import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import type { Prisma, UserFindManyArgs } from '$lib/server/db.js';
import { db } from '$lib/server/db.js';
import {
  composeMiddleware,
  withInternalApiKey,
  withIpWhitelist,
} from '$lib/server/middleware/index.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 1000;

function parsePositiveInteger(value: string | null, fallback: number, name: string) {
  if (value === null) {
    return { value: fallback };
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return { error: `Invalid ${name} parameter.` };
  }

  return { value: parsed };
}

function parseDate(value: string | null, name: string) {
  if (!value) {
    return { value: null };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { error: `Invalid ${name} parameter.` };
  }

  return { value: parsed };
}

const getUsersApi: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_extract_users' });

  const pageResult = parsePositiveInteger(event.url.searchParams.get('page'), DEFAULT_PAGE, 'page');
  if ('error' in pageResult) {
    return json({ message: pageResult.error }, { status: 400 });
  }

  const pageSizeResult = parsePositiveInteger(
    event.url.searchParams.get('pageSize'),
    DEFAULT_PAGE_SIZE,
    'pageSize',
  );
  if ('error' in pageSizeResult) {
    return json({ message: pageSizeResult.error }, { status: 400 });
  }

  const lastUpdatedStartResult = parseDate(
    event.url.searchParams.get('lastUpdatedStart'),
    'lastUpdatedStart',
  );
  if ('error' in lastUpdatedStartResult) {
    return json({ message: lastUpdatedStartResult.error }, { status: 400 });
  }

  const lastUpdatedEndResult = parseDate(
    event.url.searchParams.get('lastUpdatedEnd'),
    'lastUpdatedEnd',
  );
  if ('error' in lastUpdatedEndResult) {
    return json({ message: lastUpdatedEndResult.error }, { status: 400 });
  }

  const page = pageResult.value;
  const pageSize = Math.min(pageSizeResult.value, MAX_PAGE_SIZE);
  const skip = (page - 1) * pageSize;

  const updatedAtFilter: Prisma.DateTimeFilter = {};
  if (lastUpdatedStartResult.value) {
    updatedAtFilter.gte = lastUpdatedStartResult.value;
  }
  if (lastUpdatedEndResult.value) {
    updatedAtFilter.lte = lastUpdatedEndResult.value;
  }

  const where =
    Object.keys(updatedAtFilter).length > 0 ? { updatedAt: updatedAtFilter } : undefined;

  const userArgs = {
    where,
    orderBy: {
      updatedAt: 'asc',
    },
    skip,
    take: pageSize,
  } satisfies UserFindManyArgs;

  try {
    const [users, totalCount] = await Promise.all([
      db.user.findMany(userArgs),
      db.user.count({ where }),
    ]);

    return json({
      data: users,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: page * pageSize < totalCount,
        hasPreviousPage: page > 1,
      },
      filters: {
        lastUpdatedStart: lastUpdatedStartResult.value?.toISOString() ?? null,
        lastUpdatedEnd: lastUpdatedEndResult.value?.toISOString() ?? null,
      },
    });
  } catch (err) {
    logger.error({ err }, 'Failed to extract users');
    return json({ message: 'Failed to extract users.' }, { status: 500 });
  }
};

export const GET: RequestHandler = composeMiddleware([withIpWhitelist, withInternalApiKey])(
  getUsersApi,
);
