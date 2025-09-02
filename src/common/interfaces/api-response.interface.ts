export interface ApiResponse<T = any> {
  data: T;
  status: 'success' | 'error' | 'warning';
  message?: string;
  errors?: string[];
  meta: {
    timestamp: string;
    requestId?: string;
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ServiceResponse<T> {
  data: T;
  message?: string;
}

export interface PaginationArgs {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}
