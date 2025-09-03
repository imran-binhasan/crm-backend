import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const response = exceptionResponse as any;
        message = response.message || response.error || message;
        errors = Array.isArray(response.message) ? response.message : [message];
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errors = [message];
    }

    const errorResponse: ApiResponse = {
      data: null,
      status: 'error',
      message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.headers['x-request-id'],
      },
    };

    response.status(status).json(errorResponse);
  }
}
