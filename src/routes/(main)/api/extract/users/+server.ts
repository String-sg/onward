import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import type { UserFindManyArgs } from '$lib/server/db.js';
import { db } from '$lib/server/db.js';
import {
  composeMiddleware,
  withInternalApiKey,
  withIpWhitelist,
} from '$lib/server/middleware/index.js';

import {
  buildPagination,
  buildUpdatedAtFilters,
  buildUpdatedAtWhere,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  parseDate,
  parsePositiveInteger,
} from '../helpers.js';

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

  const where = buildUpdatedAtWhere(lastUpdatedStartResult.value, lastUpdatedEndResult.value);

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
      pagination: buildPagination(page, pageSize, totalCount),
      filters: buildUpdatedAtFilters(lastUpdatedStartResult.value, lastUpdatedEndResult.value),
    });
  } catch (err) {
    logger.error({ err }, 'Failed to extract users');
    return json({ message: 'Failed to extract users.' }, { status: 500 });
  }
};

export const GET: RequestHandler = composeMiddleware([withIpWhitelist, withInternalApiKey])(
  getUsersApi,
);
