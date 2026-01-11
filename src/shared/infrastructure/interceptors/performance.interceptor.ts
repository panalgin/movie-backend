import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { CORRELATION_ID_HEADER } from '../middleware/correlation-id.middleware';

const SLOW_REQUEST_THRESHOLD_MS = 100;

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const correlationId = request.headers[
      CORRELATION_ID_HEADER.toLowerCase()
    ] as string;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        if (duration >= SLOW_REQUEST_THRESHOLD_MS) {
          this.logger.warn(
            `Slow request: ${method} ${url} - ${duration}ms [${correlationId}]`,
          );
        }
      }),
    );
  }
}
