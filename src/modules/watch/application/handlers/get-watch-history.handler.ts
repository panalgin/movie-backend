import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { WatchHistory } from '../../domain/entities';
import type { IWatchHistoryRepository } from '../../domain/repositories';
import { WATCH_HISTORY_REPOSITORY } from '../../domain/repositories';
import { GetWatchHistoryQuery } from '../queries';

@QueryHandler(GetWatchHistoryQuery)
export class GetWatchHistoryHandler
  implements IQueryHandler<GetWatchHistoryQuery>
{
  constructor(
    @Inject(WATCH_HISTORY_REPOSITORY)
    private readonly watchHistoryRepository: IWatchHistoryRepository,
  ) {}

  async execute(query: GetWatchHistoryQuery): Promise<WatchHistory[]> {
    return this.watchHistoryRepository.findByUserId(query.userId);
  }
}
