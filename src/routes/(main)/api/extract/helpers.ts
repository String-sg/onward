export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 100;
export const MAX_PAGE_SIZE = 1000;

type ParseResult<T> = { value: T } | { error: string };

export function parsePositiveInteger(
  value: string | null,
  fallback: number,
  name: string,
): ParseResult<number> {
  if (value === null) {
    return { value: fallback };
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return { error: `Invalid ${name} parameter.` };
  }

  return { value: parsed };
}

export function parseDate(value: string | null, name: string): ParseResult<Date | null> {
  if (!value) {
    return { value: null };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { error: `Invalid ${name} parameter.` };
  }

  return { value: parsed };
}

export function buildUpdatedAtWhere(lastUpdatedStart: Date | null, lastUpdatedEnd: Date | null) {
  const updatedAt: { gte?: Date; lte?: Date } = {};

  if (lastUpdatedStart) {
    updatedAt.gte = lastUpdatedStart;
  }

  if (lastUpdatedEnd) {
    updatedAt.lte = lastUpdatedEnd;
  }

  return Object.keys(updatedAt).length > 0 ? { updatedAt } : undefined;
}

export function buildPagination(page: number, pageSize: number, totalCount: number) {
  return {
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    hasNextPage: page * pageSize < totalCount,
    hasPreviousPage: page > 1,
  };
}

export function buildUpdatedAtFilters(lastUpdatedStart: Date | null, lastUpdatedEnd: Date | null) {
  return {
    lastUpdatedStart: lastUpdatedStart?.toISOString() ?? null,
    lastUpdatedEnd: lastUpdatedEnd?.toISOString() ?? null,
  };
}
