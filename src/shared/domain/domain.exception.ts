import type { DomainErrorCode } from './domain-error-code.enum';

export class DomainException extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}
