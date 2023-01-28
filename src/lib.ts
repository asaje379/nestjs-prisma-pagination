import { PaginationArgs, PaginationOptions } from './typings';

export function paginate(args?: PaginationArgs, options?: PaginationOptions) {
  if (!args) return undefined;
  const { page, limit, search, from, to } = args;
  const page_ = page ? Number(page) : 1;
  const limit_ = limit ? Number(limit) : 100;

  const where = handleSearch(search, options);

  const query: any = {
    where: { ...where, ...handleDateRange(from, to) },
    take: limit_ === -1 ? undefined : limit_,
    skip: limit_ === -1 ? 0 : (page_ - 1) * limit_,
    orderBy: options?.orderBy ?? { createdAt: 'desc' },
  };

  handleIncludes(options, query);

  return query;
}

function handleDateRange(
  from?: string,
  to?: string,
  attr: string = 'createdAt',
) {
  const query: any = {};
  if (from) {
    query.gte = new Date(new Date(from).setHours(0, 0, 0));
  }
  if (to) {
    query.lte = new Date(new Date(to).setHours(23, 59, 59));
  }
  if (!from && !to) return {};
  return { [attr]: query };
}

function handleIncludes(query: any, options?: PaginationOptions) {
  const include: any = {};
  if (options && options.includes) {
    for (const field of options.includes) {
      if (!field.includes('.')) {
        include[field] = true;
        continue;
      }
      include[field] = dotStringToObject(field, null, true);
    }
  }
  query.include = include;
}

function dotStringToObject(
  dotStr: string,
  value: any,
  include: boolean = false,
): any {
  if (dotStr.length === 0) return include ? { value: true } : value;
  const attrs = dotStr.split('.');
  const next = attrs.slice(1).join('.');
  return {
    [attrs[0]]: include
      ? {
          include:
            next.length > 1
              ? dotStringToObject(next, value, true)
              : { [next[0]]: true },
        }
      : dotStringToObject(next, value),
  };
}

function handleSearch(search?: string, options?: PaginationOptions) {
  let where: Record<string, any> = {};
  const searchQuery = { contains: search, mode: 'insensitive' };
  if (options?.enabled) {
    where.enabled = true;
  }

  if (search && options?.search?.length) {
    where.OR = [];

    for (const field of options.search) {
      if (!field.includes('.')) {
        where.OR.push({ [field]: searchQuery });
        continue;
      }
      where.OR.push(dotStringToObject(field, searchQuery));
    }
  }

  // Handle numbers and enums searching
  if (options?.equals?.length) {
    where.OR = [];

    for (const field of options.equals) {
      if (!field.includes('.')) {
        where.OR.push({ [field]: search });
        continue;
      }
      where.OR.push(dotStringToObject(field, search));
    }
  }

  return where;
}
