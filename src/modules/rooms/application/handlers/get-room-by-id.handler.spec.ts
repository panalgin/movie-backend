import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationErrorCode } from '../../../../shared/application';
import { Room } from '../../domain/entities';
import { ROOM_REPOSITORY } from '../../domain/repositories';
import { GetRoomByIdQuery } from '../queries/get-room-by-id.query';
import { GetRoomByIdHandler } from './get-room-by-id.handler';

describe('GetRoomByIdHandler', () => {
  let handler: GetRoomByIdHandler;
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRoomByIdHandler,
        { provide: ROOM_REPOSITORY, useValue: roomRepository },
      ],
    }).compile();

    handler = module.get<GetRoomByIdHandler>(GetRoomByIdHandler);
  });

  it('should return room by id', async () => {
    const query = new GetRoomByIdQuery('room-id');

    const result = await handler.execute(query);

    expect(result).toBeDefined();
    expect(result.id).toBe('room-id');
    expect(result.number).toBe(1);
    expect(result.capacity).toBe(50);
    expect(roomRepository.findById).toHaveBeenCalledWith('room-id');
  });

  it('should throw ApplicationException if room not found', async () => {
    roomRepository.findById.mockResolvedValue(null);

    const query = new GetRoomByIdQuery('non-existent-id');

    await expect(handler.execute(query)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.ROOM_NOT_FOUND,
      }),
    );
  });
});
