import { PaginationArgs, PaginationOptions } from './typings';

export function paginate(args?: PaginationArgs, options?: PaginationOptions) {
  if (!args) return { where: options?.enabled ? { enabled: true } : {} };
  const { page, limit, search, from, to } = args;
  const page_ = page ? Number(page) : 1;
  const limit_ = limit ? Number(limit) : 100;

  const where = handleSearch(search, options);

  const query: any = {
    where: { ...where, ...handleDateRange(from, to, options?.dateAttr) },
    take: limit_ === -1 ? undefined : limit_,
    skip: limit_ === -1 ? 0 : (page_ - 1) * limit_,
    orderBy: options?.orderBy ?? { createdAt: 'desc' },
  };

  handleIncludes(query, options);

  if (query.include && Object.keys(query.include).length === 0)
    delete query.include;

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

export function handleIncludes(query: any, options?: PaginationOptions) {
  if (options && options.includes) {
    let include: any = {};
    const objects = [];
    for (const field of options.includes) {
      if (!field.includes('.')) {
        include[field] = true;
        continue;
      }

      objects.push(dotStringToObject(field, null, true));
    }
    query.include = { ...include, ...mergeObjects(...objects) };
  }
  return query;
}

function dotStringToObject(
  dotStr: string,
  value: any,
  include: boolean = false,
): any {
  const attrs = dotStr.split('.');
  const next = attrs.slice(1).join('.');

  if (attrs.length === 1) return { [attrs[0]]: include ? true : value };

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

function mergeTwoObjects(src1: Record<string, any>, src2: Record<string, any>) {
  let result: Record<string, any> = {};

  for (const key in src1) {
    console.log(key);
    if (!(key in src2)) {
      result[key] = src1[key];
      continue;
    }
    result[key] = mergeTwoObjects(src1[key], src2[key]);
  }

  for (const key in src2) {
    console.log(key);
    if (!(key in src1)) {
      result[key] = src2[key];
      continue;
    }
    result[key] = mergeTwoObjects(src1[key], src2[key]);
  }

  return result;
}

function mergeObjects(...srcs: Record<string, any>[]) {
  if (srcs.length === 0) return null;
  if (srcs.length === 1) return srcs[0];
  let result = mergeTwoObjects(srcs[0], srcs[1]);
  for (let i = 2; i < srcs.length; i++) {
    result = mergeTwoObjects(result, srcs[i]);
  }
  return result;
}

function handle(options: string[], where: any, value: any) {
  if (options.length) {
    for (const field of options) {
      if (!value) continue;
      if (!field.includes('.')) {
        where.OR.push({ [field]: value });
        continue;
      }
      const result = dotStringToObject(field, value);
      if (Object.keys(result).length) {
        where.OR.push(result);
      }
    }
  }
}

function handleSearch(search?: string, options?: PaginationOptions) {
  let where: Record<string, any> = {};

  const searchQuery = { contains: search, mode: 'insensitive' };
  if (options?.enabled) {
    where.enabled = true;
  }

  if (search) {
    where.OR = [];
    handle(options?.search ?? [], where, searchQuery);
    handle(
      options?.equals ?? [],
      where,
      !isNaN(+search) ? Number(search) : undefined,
    );
    handle(options?.enums ?? [], where, search);
  }

  return where;
}
