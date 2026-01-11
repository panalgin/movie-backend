import { WatchHistory } from '../entities';

export const WATCH_HISTORY_REPOSITORY = Symbol('WATCH_HISTORY_REPOSITORY');

export interface IWatchHistoryRepository {
  findById(id: string): Promise<WatchHistory | null>;
  findByUserId(userId: string): Promise<WatchHistory[]>;
  save(watchHistory: WatchHistory): Promise<WatchHistory>;
}
