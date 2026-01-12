import { Test, type TestingModule } from '@nestjs/testing';
import { Room } from '../../domain/entities';
import { ROOM_REPOSITORY } from '../../domain/repositories';
import { GetRoomsQuery } from '../queries/get-rooms.query';
import { GetRoomsHandler } from './get-rooms.handler';

describe('GetRoomsHandler', () => {
  let handler: GetRoomsHandler;
  let roomRepository: Record<string, jest.Mock>;

  const mockRooms = [
    Room.reconstitute('room-1', {
      number: 1,
      capacity: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    Room.reconstitute('room-2', {
      number: 2,
      capacity: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    Room.reconstitute('room-3', {
      number: 3,
      capacity: 75,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ];

  beforeEach(async () => {
    roomRepository = {
      findAll: jest.fn().mockResolvedValue(mockRooms),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRoomsHandler,
        { provide: ROOM_REPOSITORY, useValue: roomRepository },
      ],
    }).compile();

    handler = module.get<GetRoomsHandler>(GetRoomsHandler);
  });

  it('should return all rooms', async () => {
    const query = new GetRoomsQuery(0, 50);

    const result = await handler.execute(query);

    expect(result).toHaveLength(3);
    expect(roomRepository.findAll).toHaveBeenCalled();
  });

  it('should apply pagination - skip', async () => {
    const query = new GetRoomsQuery(1, 50);

    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(result[0].number).toBe(2);
  });

  it('should apply pagination - take', async () => {
    const query = new GetRoomsQuery(0, 2);

    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(result[0].number).toBe(1);
    expect(result[1].number).toBe(2);
  });

  it('should apply pagination - skip and take', async () => {
    const query = new GetRoomsQuery(1, 1);

    const result = await handler.execute(query);

    expect(result).toHaveLength(1);
    expect(result[0].number).toBe(2);
  });

  it('should return empty array when skip exceeds count', async () => {
    const query = new GetRoomsQuery(10, 50);

    const result = await handler.execute(query);

    expect(result).toHaveLength(0);
  });
});
