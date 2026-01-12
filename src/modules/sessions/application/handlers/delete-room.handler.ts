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
import {
  type IRoomRepository,
  ROOM_REPOSITORY,
} from '../../domain/repositories';
import { DeleteRoomCommand } from '../commands/delete-room.command';

@CommandHandler(DeleteRoomCommand)
export class DeleteRoomHandler implements ICommandHandler<DeleteRoomCommand> {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(command: DeleteRoomCommand): Promise<void> {
    const room = await this.roomRepository.findById(command.id);
    if (!room) {
      throw new ApplicationException(
        ApplicationErrorCode.ROOM_NOT_FOUND,
        `Room with ID ${command.id} not found`,
        { roomId: command.id },
      );
    }

    await this.roomRepository.delete(command.id);

    await this.auditService.logSuccess(
      {
        action: AuditAction.ROOM_DELETE,
        entityType: AuditEntityType.ROOM,
        entityId: command.id,
        metadata: {
          roomNumber: room.number,
          capacity: room.capacity,
        },
      },
      {
        actorId: command.actorId,
        actorRole: command.actorRole,
      },
    );
  }
}
