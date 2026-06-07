import {
  DEFAULT_PAGE,
  DEFAULT_PER_PAGE,
  PaginationQueryDto,
} from './dto/pagination.dto';
import { paginated, PaginatedResult } from './dto/paginated.dto';

interface PrismaPaginableDelegate {
  count(args?: any): Promise<number>;
  findMany(args?: any): Promise<any[]>;
}

interface PaginatePrismaOptions {
  where?: unknown;
  orderBy?: unknown;
  include?: unknown;
  select?: unknown;
}

/**
 * Run Prisma `count` + `findMany` honoring PaginationQueryDto.
 * If `disable_pagination` is true, returns every row and skips count.
 */
export async function paginatePrisma<T>(
  delegate: PrismaPaginableDelegate,
  query: PaginationQueryDto,
  options: PaginatePrismaOptions = {},
): Promise<PaginatedResult<T>> {
  const page = query.page ?? DEFAULT_PAGE;
  const per_page = query.per_page ?? DEFAULT_PER_PAGE;

  const base = {
    where: options.where,
    orderBy: options.orderBy,
    include: options.include,
    select: options.select,
  };

  if (query.disable_pagination) {
    const data = (await delegate.findMany(base)) as T[];
    return paginated(data, data.length, 1, data.length || per_page);
  }

  const [total, data] = await Promise.all([
    delegate.count({ where: options.where }),
    delegate.findMany({
      ...base,
      skip: (page - 1) * per_page,
      take: per_page,
    }) as Promise<T[]>,
  ]);

  return paginated(data, total, page, per_page);
}

/**
 * Paginate an already-in-memory array. Use when the source is not a
 * Prisma delegate (eg. computed aggregates or fan-in from multiple tables).
 */
export function paginateArray<T>(
  items: T[],
  query: PaginationQueryDto,
): PaginatedResult<T> {
  const page = query.page ?? DEFAULT_PAGE;
  const per_page = query.per_page ?? DEFAULT_PER_PAGE;
  const total = items.length;
  if (query.disable_pagination) {
    return paginated(items, total, 1, total || per_page);
  }
  const start = (page - 1) * per_page;
  const slice = items.slice(start, start + per_page);
  return paginated(slice, total, page, per_page);
}
