import { PaginationArgs, PaginationOptions } from './typings';
export declare function paginate(args?: PaginationArgs, options?: PaginationOptions): any;
export declare function handleDateRange(from?: string, to?: string, attr?: string): {
    [x: string]: any;
};
export declare function handleIncludes(query: any, options?: PaginationOptions): void;
export declare function handleSearch(search?: string, options?: PaginationOptions): {
    enabled: boolean;
    OR?: any[] | undefined;
};
