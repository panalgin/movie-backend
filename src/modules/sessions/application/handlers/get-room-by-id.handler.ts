import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationErrorCode,
  ApplicationException,
} from '../../../../shared/application';
import type { Room } from '../../domain/entities';
import {
  type IRoomRepository,
  ROOM_REPOSITORY,
} from '../../domain/repositories';
import { GetRoomByIdQuery } from '../queries/get-room-by-id.query';

@QueryHandler(GetRoomByIdQuery)
export class GetRoomByIdHandler implements IQueryHandler<GetRoomByIdQuery> {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(query: GetRoomByIdQuery): Promise<Room> {
    const room = await this.roomRepository.findById(query.id);

    if (!room) {
      throw new ApplicationException(
        ApplicationErrorCode.ROOM_NOT_FOUND,
        `Room with ID ${query.id} not found`,
        { roomId: query.id },
      );
    }

    return room;
  }
}
