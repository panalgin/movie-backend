import type { ApplicationErrorCode } from './application-error-code.enum';

export class ApplicationException extends Error {
  constructor(
    public readonly code: ApplicationErrorCode,
    message: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApplicationException';
  }
}
