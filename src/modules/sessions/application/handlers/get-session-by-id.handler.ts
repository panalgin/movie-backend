import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationErrorCode,
  ApplicationException,
} from '../../../../shared/application';
import type { Session } from '../../domain/entities';
import type { ISessionRepository } from '../../domain/repositories';
import { SESSION_REPOSITORY } from '../../domain/repositories';
import { GetSessionByIdQuery } from '../queries';

@QueryHandler(GetSessionByIdQuery)
export class GetSessionByIdHandler
  implements IQueryHandler<GetSessionByIdQuery>
{
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(query: GetSessionByIdQuery): Promise<Session> {
    const session = await this.sessionRepository.findById(query.id);

    if (!session) {
      throw new ApplicationException(
        ApplicationErrorCode.SESSION_NOT_FOUND,
        `Session with ID ${query.id} not found`,
        { sessionId: query.id },
      );
    }

    return session;
  }
}
