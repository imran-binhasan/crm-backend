import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const requestId = req.headers['x-request-id'] as string;

    // Log incoming request
    this.logger.log(
      `🔥 ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent} - RequestId: ${requestId}`
    );

    // Log response when it finishes
    res.on('finish', () => {
      const duration = Date.now() - start;
      const { statusCode } = res;
      const statusEmoji = statusCode >= 400 ? '❌' : '✅';
      
      this.logger.log(
        `${statusEmoji} ${method} ${originalUrl} ${statusCode} - ${duration}ms - RequestId: ${requestId}`
      );
    });

    next();
  }
}
