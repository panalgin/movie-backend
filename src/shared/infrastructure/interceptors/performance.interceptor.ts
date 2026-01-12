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

const SLOW_REQUEST_THRESHOLD_MS = 200;

interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string };
}

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { method, url } = request;
    const correlationId = request.headers[
      CORRELATION_ID_HEADER.toLowerCase()
    ] as string;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        if (duration >= SLOW_REQUEST_THRESHOLD_MS) {
          const userId = request.user?.id ?? 'anonymous';
          this.logger.warn(
            `Slow request: ${method} ${url} - ${duration}ms [cid: ${correlationId}] [user: ${userId}]`,
          );
        }
      }),
    );
  }
}
