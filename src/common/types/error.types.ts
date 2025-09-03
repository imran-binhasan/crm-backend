export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Business Logic
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_IN_USE = 'RESOURCE_IN_USE',

  // System
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Invoice specific
  INVOICE_ALREADY_SENT = 'INVOICE_ALREADY_SENT',
  INVOICE_ALREADY_PAID = 'INVOICE_ALREADY_PAID',
  PAYMENT_EXCEEDS_TOTAL = 'PAYMENT_EXCEEDS_TOTAL',
  INVALID_INVOICE_STATUS = 'INVALID_INVOICE_STATUS',
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  field?: string;
  value?: any;
  context?: Record<string, any>;
}

export interface ApiError {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: ErrorDetails[];
    timestamp: string;
    path?: string;
    requestId?: string;
  };
}

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, any>;
}
