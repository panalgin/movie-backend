import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationErrorCode,
  ApplicationException,
} from '../../../../shared/application';
import {
  AuditAction,
  AuditEntityType,
  AuditService,
} from '../../../audit/application';
import { Room } from '../../domain/entities';
import {
  type IRoomRepository,
  ROOM_REPOSITORY,
} from '../../domain/repositories';
import { CreateRoomCommand } from '../commands/create-room.command';

@CommandHandler(CreateRoomCommand)
export class CreateRoomHandler implements ICommandHandler<CreateRoomCommand> {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(command: CreateRoomCommand): Promise<Room> {
    // Check if room number already exists
    const existingRoom = await this.roomRepository.existsByNumber(
      command.number,
    );
    if (existingRoom) {
      throw new ApplicationException(
        ApplicationErrorCode.ROOM_NUMBER_EXISTS,
        `Room number ${command.number} already exists`,
        { roomNumber: command.number },
      );
    }

    const room = Room.create({
      number: command.number,
      capacity: command.capacity,
    });

    const savedRoom = await this.roomRepository.save(room);

    await this.auditService.logSuccess(
      {
        action: AuditAction.ROOM_CREATE,
        entityType: AuditEntityType.ROOM,
        entityId: savedRoom.id,
        metadata: {
          roomNumber: savedRoom.number,
          capacity: savedRoom.capacity,
        },
      },
      {
        actorId: command.actorId,
        actorRole: command.actorRole,
      },
    );

    return savedRoom;
  }
}
