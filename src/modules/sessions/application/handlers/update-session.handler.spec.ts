import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { AuditService } from '../../../audit/application';
import { TimeSlotEnum } from '../../../movies/domain/value-objects';
import { Session } from '../../domain/entities';
import { ROOM_REPOSITORY, SESSION_REPOSITORY } from '../../domain/repositories';
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

  it('should throw NotFoundException if session not found', async () => {
    sessionRepository.findById.mockResolvedValue(null);

    const command = new UpdateSessionCommand(
      'non-existent-id',
      undefined,
      undefined,
      TimeSlotEnum.SLOT_16_18,
      'actor-id',
      'MANAGER',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    await expect(handler.execute(command)).rejects.toThrow(
      'Session with ID non-existent-id not found',
    );
  });

  it('should throw NotFoundException if new room not found', async () => {
    roomRepository.findById.mockResolvedValue(null);

    const command = new UpdateSessionCommand(
      'session-id',
      'non-existent-room',
      undefined,
      undefined,
      'actor-id',
      'MANAGER',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    await expect(handler.execute(command)).rejects.toThrow(
      'Room with ID non-existent-room not found',
    );
  });

  it('should throw ConflictException for double-booking', async () => {
    sessionRepository.existsConflict.mockResolvedValue(true);

    const command = new UpdateSessionCommand(
      'session-id',
      'room-id-2',
      undefined,
      undefined,
      'actor-id',
      'MANAGER',
    );

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    await expect(handler.execute(command)).rejects.toThrow(
      'This room is already booked for this time slot on this date',
    );
  });
});
