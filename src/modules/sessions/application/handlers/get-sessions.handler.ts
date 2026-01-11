import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Session } from '../../domain/entities';
import type { ISessionRepository } from '../../domain/repositories';
import { SESSION_REPOSITORY } from '../../domain/repositories';
import { GetSessionsQuery } from '../queries';

@QueryHandler(GetSessionsQuery)
export class GetSessionsHandler implements IQueryHandler<GetSessionsQuery> {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(query: GetSessionsQuery): Promise<Session[]> {
    return this.sessionRepository.findAll({
      movieId: query.movieId,
      date: query.date,
      roomNumber: query.roomNumber,
      skip: query.skip,
      take: query.take,
    });
  }
}
