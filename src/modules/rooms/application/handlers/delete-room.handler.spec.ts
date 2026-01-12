import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationErrorCode } from '../../../../shared/application';
import { AuditService } from '../../../audit/application';
import { Room } from '../../domain/entities';
import { ROOM_REPOSITORY } from '../../domain/repositories';
import { DeleteRoomCommand } from '../commands/delete-room.command';
import { DeleteRoomHandler } from './delete-room.handler';

describe('DeleteRoomHandler', () => {
  let handler: DeleteRoomHandler;
  let roomRepository: Record<string, jest.Mock>;

  const mockRoom = Room.reconstitute('room-id', {
    number: 1,
    capacity: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    roomRepository = {
      findById: jest.fn().mockResolvedValue(mockRoom),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRoomHandler,
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

    handler = module.get<DeleteRoomHandler>(DeleteRoomHandler);
  });

  it('should delete room successfully', async () => {
    const command = new DeleteRoomCommand('room-id', 'actor-id', 'MANAGER');

    await handler.execute(command);

    expect(roomRepository.findById).toHaveBeenCalledWith('room-id');
    expect(roomRepository.delete).toHaveBeenCalledWith('room-id');
  });

  it('should throw ApplicationException if room not found', async () => {
    roomRepository.findById.mockResolvedValue(null);

    const command = new DeleteRoomCommand(
      'non-existent-id',
      'actor-id',
      'MANAGER',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.ROOM_NOT_FOUND,
      }),
    );
    expect(roomRepository.delete).not.toHaveBeenCalled();
  });
});
