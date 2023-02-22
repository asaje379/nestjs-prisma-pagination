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
  includes?: string[];
  search?: string[];
  equals?: string[];
  enums?: string[];
  orderBy?: Record<string, 'asc' | 'desc'>;
  enabled?: boolean;
  dateAttr?: string;
}
