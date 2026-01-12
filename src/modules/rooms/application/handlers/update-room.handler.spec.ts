import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationErrorCode } from '../../../../shared/application';
import { AuditService } from '../../../audit/application';
import { Room } from '../../domain/entities';
import { ROOM_REPOSITORY } from '../../domain/repositories';
import { UpdateRoomCommand } from '../commands/update-room.command';
import { UpdateRoomHandler } from './update-room.handler';

describe('UpdateRoomHandler', () => {
  let handler: UpdateRoomHandler;
  let roomRepository: Record<string, jest.Mock>;
  let mockRoom: Room;

  beforeEach(async () => {
    mockRoom = Room.reconstitute('room-id', {
      number: 1,
      capacity: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    roomRepository = {
      findById: jest.fn().mockResolvedValue(mockRoom),
      update: jest.fn().mockImplementation((room) => Promise.resolve(room)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRoomHandler,
        { provide: ROOM_REPOSITORY, useValue: roomRepository },
        {
          provide: AuditService,
          useValue: {
            logSuccess: jest.fn().mockResolvedValue(undefined),
            logFailure: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateRoomHandler>(UpdateRoomHandler);
  });

  it('should update room capacity', async () => {
    const command = new UpdateRoomCommand(
      'room-id',
      100,
      'actor-id',
      'MANAGER',
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(roomRepository.update).toHaveBeenCalled();
  });

  it('should return existing room if no changes', async () => {
    const command = new UpdateRoomCommand('room-id', 50, 'actor-id', 'MANAGER');

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.capacity).toBe(50);
    expect(roomRepository.update).not.toHaveBeenCalled();
  });

  it('should throw ApplicationException if room not found', async () => {
    roomRepository.findById.mockResolvedValue(null);

    const command = new UpdateRoomCommand(
      'non-existent-id',
      100,
      'actor-id',
      'MANAGER',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.ROOM_NOT_FOUND,
      }),
    );
  });
});
