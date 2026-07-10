export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  code?: string;
  details?: unknown;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}
