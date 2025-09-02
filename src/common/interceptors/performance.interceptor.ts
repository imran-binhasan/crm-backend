import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const handler = context.getHandler().name;
    const className = context.getClass().name;
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        if (duration > 1000) {
          this.logger.warn(`⚠️  Slow operation detected: ${className}.${handler} took ${duration}ms`);
        } else {
          this.logger.debug(`⚡ ${className}.${handler} completed in ${duration}ms`);
        }
      }),
      catchError((error) => {
        const duration = Date.now() - start;
        this.logger.error(`💥 ${className}.${handler} failed after ${duration}ms: ${error.message}`);
        return throwError(() => error);
      })
    );
  }
}
