export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface UninterceptedApiError {
  message: string | Record<string, string[]>;
  statusCode?: number;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  max_page: number;
  count: number | null;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  meta: PaginationMeta;
}

export interface PaginationQuery {
  page?: number;
  per_page?: number;
  disable_pagination?: boolean;
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export type Role = 'TUTOR' | 'STUDENT' | 'ADMIN';
