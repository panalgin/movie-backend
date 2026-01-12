import { Test, type TestingModule } from '@nestjs/testing';
import { WatchHistory } from '../../domain/entities';
import { WATCH_HISTORY_REPOSITORY } from '../../domain/repositories';
import { GetWatchHistoryQuery } from '../queries';
import { GetWatchHistoryHandler } from './get-watch-history.handler';

describe('GetWatchHistoryHandler', () => {
  let handler: GetWatchHistoryHandler;
  let watchHistoryRepository: Record<string, jest.Mock>;

  const mockHistory = [
    WatchHistory.reconstitute('history-1', {
      userId: 'user-id',
      movieId: 'movie-1',
      watchedAt: new Date(),
    }),
    WatchHistory.reconstitute('history-2', {
      userId: 'user-id',
      movieId: 'movie-2',
      watchedAt: new Date(),
    }),
  ];

  beforeEach(async () => {
    watchHistoryRepository = {
      findByUserId: jest.fn().mockResolvedValue(mockHistory),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetWatchHistoryHandler,
        { provide: WATCH_HISTORY_REPOSITORY, useValue: watchHistoryRepository },
      ],
    }).compile();

    handler = module.get<GetWatchHistoryHandler>(GetWatchHistoryHandler);
  });

  it('should return watch history for user', async () => {
    const query = new GetWatchHistoryQuery('user-id');

    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(watchHistoryRepository.findByUserId).toHaveBeenCalledWith('user-id');
  });

  it('should return empty array if user has no watch history', async () => {
    watchHistoryRepository.findByUserId.mockResolvedValue([]);

    const query = new GetWatchHistoryQuery('user-with-no-history');

    const result = await handler.execute(query);

    expect(result).toHaveLength(0);
  });
});
