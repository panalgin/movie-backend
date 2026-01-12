import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationErrorCode } from '../../../../shared/application';
import { TimeSlotEnum } from '../../../movies/domain/value-objects';
import { Session } from '../../domain/entities';
import { SESSION_REPOSITORY } from '../../domain/repositories';
import { GetSessionByIdQuery } from '../queries';
import { GetSessionByIdHandler } from './get-session-by-id.handler';

describe('GetSessionByIdHandler', () => {
  let handler: GetSessionByIdHandler;
  let sessionRepository: Record<string, jest.Mock>;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  const mockSession = Session.reconstitute('session-id', {
    movieId: 'movie-id',
    roomId: 'room-id',
    date: futureDate,
    timeSlot: TimeSlotEnum.SLOT_14_16,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    sessionRepository = {
      findById: jest.fn().mockResolvedValue(mockSession),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSessionByIdHandler,
        { provide: SESSION_REPOSITORY, useValue: sessionRepository },
      ],
    }).compile();

    handler = module.get<GetSessionByIdHandler>(GetSessionByIdHandler);
  });

  it('should return session by id', async () => {
    const query = new GetSessionByIdQuery('session-id');

    const result = await handler.execute(query);

    expect(result).toBeDefined();
    expect(result.id).toBe('session-id');
    expect(result.movieId).toBe('movie-id');
    expect(sessionRepository.findById).toHaveBeenCalledWith('session-id');
  });

  it('should throw ApplicationException if session not found', async () => {
    sessionRepository.findById.mockResolvedValue(null);

    const query = new GetSessionByIdQuery('non-existent-id');

    await expect(handler.execute(query)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.SESSION_NOT_FOUND,
      }),
    );
  });
});
