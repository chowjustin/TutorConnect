import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from './pagination.dto';

export interface PaginationMeta {
  page: number;
  per_page: number;
  max_page: number;
  count: number | null;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export const PAGINATED_MARKER = Symbol.for('dbb.paginated');

export function paginated<T>(
  data: T[],
  count: number | null,
  page: number = DEFAULT_PAGE,
  per_page: number = DEFAULT_PER_PAGE,
): PaginatedResult<T> {
  const max_page =
    count === null || per_page <= 0 ? 1 : Math.max(1, Math.ceil(count / per_page));
  const result: PaginatedResult<T> = {
    data,
    meta: { page, per_page, max_page, count },
  };
  Object.defineProperty(result, PAGINATED_MARKER, {
    value: true,
    enumerable: false,
  });
  return result;
}

export function isPaginated<T>(value: unknown): value is PaginatedResult<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<symbol, unknown>)[PAGINATED_MARKER] === true
  );
}
