export type ThemeMode = 'light' | 'dark' | 'system';

export type TimeRange = '7d' | '30d' | '90d' | '6m' | '1y';

export type StatusType = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}
