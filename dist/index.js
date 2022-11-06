"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSearch = exports.handleIncludes = exports.handleDateRange = exports.paginate = void 0;
function paginate(args, options) {
    if (!args)
        return undefined;
    const { page, limit, search, from, to } = args;
    const page_ = page ? Number(page) : 1;
    const limit_ = limit ? Number(limit) : 100;
    const where = handleSearch(search, options);
    const query = {
        where: Object.assign(Object.assign({}, where), handleDateRange(from, to)),
        take: limit_ === -1 ? undefined : limit_,
        skip: limit_ === -1 ? 0 : (page_ - 1) * limit_,
        orderBy: { createdAt: 'desc' },
    };
    handleIncludes(options, query);
    return query;
}
exports.paginate = paginate;
function handleDateRange(from, to, attr = 'createdAt') {
    const query = {};
    if (from) {
        query.gte = new Date(new Date(from).setHours(0, 0, 0));
    }
    if (to) {
        query.lte = new Date(new Date(to).setHours(23, 59, 0));
    }
    if (!from && !to)
        return {};
    return { [attr]: query };
}
exports.handleDateRange = handleDateRange;
function handleIncludes(query, options) {
    if (options && options.includes && Object.keys(options.includes).length > 0)
        query.include = options.includes;
}
exports.handleIncludes = handleIncludes;
function handleSearch(search, options) {
    var _a;
    const where = { enabled: true };
    if (search && options && ((_a = options.search) === null || _a === void 0 ? void 0 : _a.length)) {
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
            }
            else {
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
exports.handleSearch = handleSearch;
