import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApplicationErrorCode, ApplicationException } from '../../application';
import { DomainException } from '../../domain';

interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

const APPLICATION_ERROR_STATUS_MAP: Record<ApplicationErrorCode, HttpStatus> = {
  // Not Found → 404
  [ApplicationErrorCode.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ApplicationErrorCode.MOVIE_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ApplicationErrorCode.SESSION_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ApplicationErrorCode.ROOM_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [ApplicationErrorCode.TICKET_NOT_FOUND]: HttpStatus.NOT_FOUND,

  // Conflict → 409
  [ApplicationErrorCode.SESSION_CONFLICT]: HttpStatus.CONFLICT,
  [ApplicationErrorCode.SESSION_SOLD_OUT]: HttpStatus.CONFLICT,
  [ApplicationErrorCode.EMAIL_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [ApplicationErrorCode.USERNAME_ALREADY_EXISTS]: HttpStatus.CONFLICT,

  // Forbidden → 403
  [ApplicationErrorCode.USER_UNDERAGE]: HttpStatus.FORBIDDEN,
  [ApplicationErrorCode.TICKET_NOT_OWNED]: HttpStatus.FORBIDDEN,
  [ApplicationErrorCode.INSUFFICIENT_ROLE]: HttpStatus.FORBIDDEN,

  // Bad Request → 400
  [ApplicationErrorCode.SESSION_IN_PAST]: HttpStatus.BAD_REQUEST,

  // Unauthorized → 401
  [ApplicationErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
  [ApplicationErrorCode.INVALID_REFRESH_TOKEN]: HttpStatus.UNAUTHORIZED,

  // Unauthorized → 401
  [ApplicationErrorCode.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [ApplicationErrorCode.TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const errorResponse = this.buildErrorResponse(exception);

    // 4xx = client errors (expected), 5xx = server errors (unexpected)
    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `${errorResponse.code}: ${errorResponse.message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${errorResponse.code}: ${errorResponse.message}`);
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown): ErrorResponse {
    const timestamp = new Date().toISOString();

    // Application Exception
    if (exception instanceof ApplicationException) {
      return {
        statusCode:
          APPLICATION_ERROR_STATUS_MAP[exception.code] ||
          HttpStatus.BAD_REQUEST,
        code: exception.code,
        message: exception.message,
        metadata: exception.metadata,
        timestamp,
      };
    }

    // Domain Exception
    if (exception instanceof DomainException) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: exception.code,
        message: exception.message,
        metadata: exception.metadata,
        timestamp,
      };
    }

    // NestJS HttpException (guards, pipes, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      return {
        statusCode: status,
        code: this.getHttpExceptionCode(status),
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as { message?: string }).message ||
              exception.message,
        timestamp,
      };
    }

    // Unknown errors
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      timestamp,
    };
  }

  private getHttpExceptionCode(status: HttpStatus): string {
    const codeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
      [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
    };
    return codeMap[status] || 'HTTP_ERROR';
  }
}
