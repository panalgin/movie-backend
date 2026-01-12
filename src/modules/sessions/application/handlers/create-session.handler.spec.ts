import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationErrorCode } from '../../../../shared/application';
import { AuditService } from '../../../audit/application';
import { MOVIE_REPOSITORY } from '../../../movies/domain/repositories';
import { TimeSlotEnum } from '../../../movies/domain/value-objects';
import { ROOM_REPOSITORY, SESSION_REPOSITORY } from '../../domain/repositories';
import { CreateSessionCommand } from '../commands';
import { CreateSessionHandler } from './create-session.handler';

describe('CreateSessionHandler', () => {
  let handler: CreateSessionHandler;
  let sessionRepository: Record<string, jest.Mock>;
  let roomRepository: Record<string, jest.Mock>;
  let movieRepository: Record<string, jest.Mock>;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  const mockMovie = {
    id: 'movie-id',
    title: 'Test Movie',
  };

  const mockRoom = {
    id: 'room-id',
    number: 1,
    capacity: 50,
  };

  beforeEach(async () => {
    sessionRepository = {
      existsConflict: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockImplementation((session) => Promise.resolve(session)),
    };

    roomRepository = {
      findById: jest.fn().mockResolvedValue(mockRoom),
    };

    movieRepository = {
      findById: jest.fn().mockResolvedValue(mockMovie),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSessionHandler,
        { provide: SESSION_REPOSITORY, useValue: sessionRepository },
        { provide: ROOM_REPOSITORY, useValue: roomRepository },
        { provide: MOVIE_REPOSITORY, useValue: movieRepository },
        {
          provide: AuditService,
          useValue: { logSuccess: jest.fn(), logFailure: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<CreateSessionHandler>(CreateSessionHandler);
  });

  it('should create session successfully', async () => {
    const command = new CreateSessionCommand(
      'movie-id',
      'room-id',
      futureDate,
      TimeSlotEnum.SLOT_14_16,
      'actor-id',
      'MANAGER',
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.movieId).toBe('movie-id');
    expect(result.roomId).toBe('room-id');
    expect(result.timeSlot).toBe(TimeSlotEnum.SLOT_14_16);
    expect(sessionRepository.save).toHaveBeenCalled();
  });

  it('should throw ApplicationException if movie not found', async () => {
    movieRepository.findById.mockResolvedValue(null);

    const command = new CreateSessionCommand(
      'movie-id',
      'room-id',
      futureDate,
      TimeSlotEnum.SLOT_14_16,
      'actor-id',
      'MANAGER',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.MOVIE_NOT_FOUND,
      }),
    );
  });

  it('should throw ApplicationException if room not found', async () => {
    roomRepository.findById.mockResolvedValue(null);

    const command = new CreateSessionCommand(
      'movie-id',
      'room-id',
      futureDate,
      TimeSlotEnum.SLOT_14_16,
      'actor-id',
      'MANAGER',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.ROOM_NOT_FOUND,
      }),
    );
  });

  it('should throw ApplicationException for double-booking', async () => {
    sessionRepository.existsConflict.mockResolvedValue(true);

    const command = new CreateSessionCommand(
      'movie-id',
      'room-id',
      futureDate,
      TimeSlotEnum.SLOT_14_16,
      'actor-id',
      'MANAGER',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.SESSION_CONFLICT,
      }),
    );
  });
});
