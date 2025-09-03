import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../types/error.types';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    public readonly errorCode: ErrorCode,
    public readonly field?: string,
    public readonly context?: Record<string, any>,
  ) {
    super(
      {
        success: false,
        error: {
          code: errorCode,
          message,
          field,
          context,
          timestamp: new Date().toISOString(),
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, identifier?: string) {
    super(
      {
        success: false,
        error: {
          code: ErrorCode.RESOURCE_NOT_FOUND,
          message: `${resource} not found${identifier ? `: ${identifier}` : ''}`,
          timestamp: new Date().toISOString(),
        },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ResourceAlreadyExistsException extends HttpException {
  constructor(resource: string, field?: string, value?: any) {
    super(
      {
        success: false,
        error: {
          code: ErrorCode.RESOURCE_ALREADY_EXISTS,
          message: `${resource} already exists${field ? ` with ${field}: ${value}` : ''}`,
          field,
          value,
          timestamp: new Date().toISOString(),
        },
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class InsufficientPermissionsException extends HttpException {
  constructor(resource: string, action: string) {
    super(
      {
        success: false,
        error: {
          code: ErrorCode.INSUFFICIENT_PERMISSIONS,
          message: `Insufficient permissions to ${action} ${resource}`,
          context: { resource, action },
          timestamp: new Date().toISOString(),
        },
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(errors: Array<{ field: string; message: string; value?: any }>) {
    super(
      {
        success: false,
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: errors.map(error => ({
            code: ErrorCode.VALIDATION_ERROR,
            message: error.message,
            field: error.field,
            value: error.value,
          })),
          timestamp: new Date().toISOString(),
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

// Invoice-specific exceptions
export class InvoiceAlreadySentException extends BusinessException {
  constructor(invoiceId: string) {
    super(
      'Invoice has already been sent and cannot be modified',
      ErrorCode.INVOICE_ALREADY_SENT,
      'status',
      { invoiceId },
    );
  }
}

export class InvoiceAlreadyPaidException extends BusinessException {
  constructor(invoiceId: string) {
    super(
      'Invoice is already marked as paid',
      ErrorCode.INVOICE_ALREADY_PAID,
      'status',
      { invoiceId },
    );
  }
}

export class PaymentExceedsTotalException extends BusinessException {
  constructor(invoiceId: string, paymentAmount: number, remainingAmount: number) {
    super(
      'Payment amount exceeds invoice remaining balance',
      ErrorCode.PAYMENT_EXCEEDS_TOTAL,
      'amount',
      { invoiceId, paymentAmount, remainingAmount },
    );
  }
}
