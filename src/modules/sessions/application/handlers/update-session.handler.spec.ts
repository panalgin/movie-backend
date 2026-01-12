import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationErrorCode } from '../../../../shared/application';
import { AuditService } from '../../../audit/application';
import { TimeSlotEnum } from '../../../movies/domain/value-objects';
import { ROOM_REPOSITORY } from '../../../rooms/domain/repositories';
import { Session } from '../../domain/entities';
import { SESSION_REPOSITORY } from '../../domain/repositories';
import { UpdateSessionCommand } from '../commands';
import { UpdateSessionHandler } from './update-session.handler';

describe('UpdateSessionHandler', () => {
  let handler: UpdateSessionHandler;
  let sessionRepository: Record<string, jest.Mock>;
  let roomRepository: Record<string, jest.Mock>;

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

  const mockRoom = {
    id: 'room-id-2',
    number: 2,
    capacity: 50,
  };

  beforeEach(async () => {
    sessionRepository = {
      findById: jest.fn().mockResolvedValue(mockSession),
      existsConflict: jest.fn().mockResolvedValue(false),
      update: jest
        .fn()
        .mockImplementation((session) => Promise.resolve(session)),
    };

    roomRepository = {
      findById: jest.fn().mockResolvedValue(mockRoom),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSessionHandler,
        { provide: SESSION_REPOSITORY, useValue: sessionRepository },
        { provide: ROOM_REPOSITORY, useValue: roomRepository },
        {
          provide: AuditService,
          useValue: { logSuccess: jest.fn(), logFailure: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<UpdateSessionHandler>(UpdateSessionHandler);
  });

  it('should update session successfully', async () => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 10);

    const command = new UpdateSessionCommand(
      'session-id',
      'room-id-2',
      newDate,
      TimeSlotEnum.SLOT_16_18,
      'actor-id',
      'MANAGER',
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.roomId).toBe('room-id-2');
    expect(result.timeSlot).toBe(TimeSlotEnum.SLOT_16_18);
    expect(sessionRepository.update).toHaveBeenCalled();
  });

  it('should update session with partial data', async () => {
    const command = new UpdateSessionCommand(
      'session-id',
      undefined,
      undefined,
      TimeSlotEnum.SLOT_18_20,
      'actor-id',
      'MANAGER',
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.timeSlot).toBe(TimeSlotEnum.SLOT_18_20);
  });

  it('should throw ApplicationException if session not found', async () => {
    sessionRepository.findById.mockResolvedValue(null);

    const command = new UpdateSessionCommand(
      'non-existent-id',
      undefined,
      undefined,
      TimeSlotEnum.SLOT_16_18,
      'actor-id',
      'MANAGER',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.SESSION_NOT_FOUND,
      }),
    );
  });

  it('should throw ApplicationException if new room not found', async () => {
    roomRepository.findById.mockResolvedValue(null);

    const command = new UpdateSessionCommand(
      'session-id',
      'non-existent-room',
      undefined,
      undefined,
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

    const command = new UpdateSessionCommand(
      'session-id',
      'room-id-2',
      undefined,
      undefined,
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
