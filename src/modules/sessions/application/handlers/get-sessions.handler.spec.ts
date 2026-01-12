import { Test, type TestingModule } from '@nestjs/testing';
import { TimeSlotEnum } from '../../../movies/domain/value-objects';
import { Session } from '../../domain/entities';
import { SESSION_REPOSITORY } from '../../domain/repositories';
import { GetSessionsQuery } from '../queries';
import { GetSessionsHandler } from './get-sessions.handler';

describe('GetSessionsHandler', () => {
  let handler: GetSessionsHandler;
  let sessionRepository: Record<string, jest.Mock>;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  const mockSessions = [
    Session.reconstitute('session-1', {
      movieId: 'movie-1',
      roomId: 'room-1',
      date: futureDate,
      timeSlot: TimeSlotEnum.SLOT_10_12,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    Session.reconstitute('session-2', {
      movieId: 'movie-2',
      roomId: 'room-1',
      date: futureDate,
      timeSlot: TimeSlotEnum.SLOT_14_16,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ];

  beforeEach(async () => {
    sessionRepository = {
      findAll: jest.fn().mockResolvedValue(mockSessions),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSessionsHandler,
        { provide: SESSION_REPOSITORY, useValue: sessionRepository },
      ],
    }).compile();

    handler = module.get<GetSessionsHandler>(GetSessionsHandler);
  });

  it('should return sessions list', async () => {
    const query = new GetSessionsQuery();

    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(sessionRepository.findAll).toHaveBeenCalled();
  });

  it('should pass filter parameters to repository', async () => {
    const filterDate = new Date();
    const query = new GetSessionsQuery('movie-1', 'room-1', filterDate, 0, 10);

    await handler.execute(query);

    expect(sessionRepository.findAll).toHaveBeenCalledWith({
      movieId: 'movie-1',
      roomId: 'room-1',
      date: filterDate,
      skip: 0,
      take: 10,
    });
  });

  it('should handle empty results', async () => {
    sessionRepository.findAll.mockResolvedValue([]);

    const query = new GetSessionsQuery();

    const result = await handler.execute(query);

    expect(result).toHaveLength(0);
  });
});
