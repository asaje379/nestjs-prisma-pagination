export interface PaginationArgs {
    page?: number;
    limit?: number;
    search?: string;
    from?: string;
    to?: string;
}
export interface DateRangeArgs {
    from?: string;
    to?: string;
}
export interface PaginationOptions {
    includes?: Record<string, boolean | any>;
    search?: string[];
}
