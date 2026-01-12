import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationErrorCode } from '../../../../shared/application';
import { AuditService } from '../../../audit/application';
import { ROOM_REPOSITORY } from '../../domain/repositories';
import { CreateRoomCommand } from '../commands/create-room.command';
import { CreateRoomHandler } from './create-room.handler';

describe('CreateRoomHandler', () => {
  let handler: CreateRoomHandler;
  let roomRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    roomRepository = {
      existsByNumber: jest.fn().mockResolvedValue(false),
      save: jest.fn().mockImplementation((room) => Promise.resolve(room)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoomHandler,
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

    handler = module.get<CreateRoomHandler>(CreateRoomHandler);
  });

  it('should create room with custom capacity', async () => {
    const command = new CreateRoomCommand(5, 100, 'actor-id', 'MANAGER');

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.number).toBe(5);
    expect(result.capacity).toBe(100);
    expect(roomRepository.save).toHaveBeenCalled();
  });

  it('should create room with default capacity when not specified', async () => {
    const command = new CreateRoomCommand(6, undefined, 'actor-id', 'MANAGER');

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.number).toBe(6);
    expect(result.capacity).toBe(50);
  });

  it('should throw ApplicationException if room number already exists', async () => {
    roomRepository.existsByNumber.mockResolvedValue(true);

    const command = new CreateRoomCommand(1, 100, 'actor-id', 'MANAGER');

    await expect(handler.execute(command)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.ROOM_NUMBER_EXISTS,
      }),
    );
  });
});
