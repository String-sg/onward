import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import type { LearningUnitCollectionFindManyArgs } from '$lib/server/db.js';
import { db } from '$lib/server/db.js';
import {
  composeMiddleware,
  withInternalApiKey,
  withIpWhitelist,
} from '$lib/server/middleware/index.js';

import {
  buildPagination,
  buildUpdatedAtFilters,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  parsePositiveInteger,
} from '../helpers.js';

const getLearningUnitCollectionsApi: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_extract_learning_unit_collections' });

  if (
    event.url.searchParams.has('lastUpdatedStart') ||
    event.url.searchParams.has('lastUpdatedEnd')
  ) {
    return json(
      {
        message:
          'lastUpdatedStart and lastUpdatedEnd filters are not supported for learning unit collections.',
      },
      { status: 400 },
    );
  }

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

  const page = pageResult.value;
  const pageSize = Math.min(pageSizeResult.value, MAX_PAGE_SIZE);
  const skip = (page - 1) * pageSize;

  const learningUnitCollectionArgs = {
    orderBy: [{ learningUnitId: 'asc' }, { collectionId: 'asc' }],
    skip,
    take: pageSize,
  } satisfies LearningUnitCollectionFindManyArgs;

  try {
    const [learningUnitCollections, totalCount] = await Promise.all([
      db.learningUnitCollection.findMany(learningUnitCollectionArgs),
      db.learningUnitCollection.count(),
    ]);

    return json({
      data: learningUnitCollections,
      pagination: buildPagination(page, pageSize, totalCount),
      filters: buildUpdatedAtFilters(null, null),
    });
  } catch (err) {
    logger.error({ err }, 'Failed to extract learning unit collections');
    return json({ message: 'Failed to extract learning unit collections.' }, { status: 500 });
  }
};

export const GET: RequestHandler = composeMiddleware([withIpWhitelist, withInternalApiKey])(
  getLearningUnitCollectionsApi,
);
