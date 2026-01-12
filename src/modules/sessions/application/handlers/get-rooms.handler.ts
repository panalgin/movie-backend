import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Room } from '../../domain/entities';
import {
  type IRoomRepository,
  ROOM_REPOSITORY,
} from '../../domain/repositories';
import { GetRoomsQuery } from '../queries/get-rooms.query';

@QueryHandler(GetRoomsQuery)
export class GetRoomsHandler implements IQueryHandler<GetRoomsQuery> {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(query: GetRoomsQuery): Promise<Room[]> {
    const rooms = await this.roomRepository.findAll();

    // Apply pagination
    const start = query.skip;
    const end = query.skip + query.take;

    return rooms.slice(start, end);
  }
}
