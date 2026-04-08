import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

import type { LearningUnitFindManyArgs } from '$lib/server/db.js';
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

const getLearningUnitsApi: RequestHandler = async (event) => {
  const logger = event.locals.logger.child({ handler: 'api_extract_learning_units' });

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

  const learningUnitArgs = {
    where,
    orderBy: {
      updatedAt: 'asc',
    },
    skip,
    take: pageSize,
  } satisfies LearningUnitFindManyArgs;

  try {
    const [learningUnits, totalCount] = await Promise.all([
      db.learningUnit.findMany(learningUnitArgs),
      db.learningUnit.count({ where }),
    ]);

    return json({
      data: learningUnits,
      pagination: buildPagination(page, pageSize, totalCount),
      filters: buildUpdatedAtFilters(lastUpdatedStartResult.value, lastUpdatedEndResult.value),
    });
  } catch (err) {
    logger.error({ err }, 'Failed to extract learning units');
    return json({ message: 'Failed to extract learning units.' }, { status: 500 });
  }
};

export const GET: RequestHandler = composeMiddleware([withIpWhitelist, withInternalApiKey])(
  getLearningUnitsApi,
);
