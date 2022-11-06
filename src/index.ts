import { PaginationArgs, PaginationOptions } from './typings';

export function paginate(args?: PaginationArgs, options?: PaginationOptions) {
  if (!args) return undefined;
  const { page, limit, search, from, to } = args;
  const page_ = page ? Number(page) : 1;
  const limit_ = limit ? Number(limit) : 100;

  const where: { enabled: boolean; OR?: any[] } = handleSearch(search, options);

  const query: any = {
    where: { ...where, ...handleDateRange(from, to) },
    take: limit_ === -1 ? undefined : limit_,
    skip: limit_ === -1 ? 0 : (page_ - 1) * limit_,
    orderBy: { createdAt: 'desc' },
  };

  handleIncludes(options, query);

  return query;
}

export function handleDateRange(
  from?: string,
  to?: string,
  attr: string = 'createdAt'
) {
  const query: any = {};
  if (from) {
    query.gte = new Date(new Date(from).setHours(0, 0, 0));
  }
  if (to) {
    query.lte = new Date(new Date(to).setHours(23, 59, 0));
  }
  if (!from && !to) return {};
  return { [attr]: query };
}

export function handleIncludes(query: any, options?: PaginationOptions) {
  if (options && options.includes && Object.keys(options.includes).length > 0)
    query.include = options.includes;
}

export function handleSearch(search?: string, options?: PaginationOptions) {
  const where: { enabled: boolean; OR?: any[] } = { enabled: true };
  if (search && options && options.search?.length) {
    where.OR = [];
    for (const field of options.search) {
      if (!field.includes('.')) {
        where.OR.push({ [field]: { contains: search, mode: 'insensitive' } });
        continue;
      }
      const [parent, field_, field__] = field.split('.');
      if (!field__) {
        where.OR.push({
          [parent]: { [field_]: { contains: search, mode: 'insensitive' } },
        });
      } else {
        where.OR.push({
          [parent]: {
            [field_]: { [field__]: { contains: search, mode: 'insensitive' } },
          },
        });
      }
    }
  }
  return where;
}
