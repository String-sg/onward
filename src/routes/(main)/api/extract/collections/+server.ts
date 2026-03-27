import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import type { CollectionFindManyArgs } from '$lib/server/db.js';
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

const getCollectionsApi: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_extract_collections' });

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

  const collectionArgs = {
    where,
    orderBy: {
      updatedAt: 'asc',
    },
    skip,
    take: pageSize,
  } satisfies CollectionFindManyArgs;

  try {
    const [collections, totalCount] = await Promise.all([
      db.collection.findMany(collectionArgs),
      db.collection.count({ where }),
    ]);

    return json({
      data: collections,
      pagination: buildPagination(page, pageSize, totalCount),
      filters: buildUpdatedAtFilters(lastUpdatedStartResult.value, lastUpdatedEndResult.value),
    });
  } catch (err) {
    logger.error({ err }, 'Failed to extract collections');
    return json({ message: 'Failed to extract collections.' }, { status: 500 });
  }
};

export const GET: RequestHandler = composeMiddleware([withIpWhitelist, withInternalApiKey])(
  getCollectionsApi,
);
