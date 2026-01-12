import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import {
  ApplicationErrorCode,
  ApplicationException,
} from '../../../../shared/application';
import { AuditService } from '../../../audit/application';
import { AuditAction, AuditEntityType } from '../../../audit/domain/enums';
import type { Room } from '../../domain/entities';
import {
  type IRoomRepository,
  ROOM_REPOSITORY,
} from '../../domain/repositories';
import { UpdateRoomCommand } from '../commands/update-room.command';

@CommandHandler(UpdateRoomCommand)
export class UpdateRoomHandler implements ICommandHandler<UpdateRoomCommand> {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(command: UpdateRoomCommand): Promise<Room> {
    const room = await this.roomRepository.findById(command.id);
    if (!room) {
      throw new ApplicationException(
        ApplicationErrorCode.ROOM_NOT_FOUND,
        `Room with ID ${command.id} not found`,
        { roomId: command.id },
      );
    }

    const changes: {
      before: Record<string, unknown>;
      after: Record<string, unknown>;
    } = {
      before: {},
      after: {},
    };

    // Room entity doesn't have update method, we need to create a new one
    // For now, we'll update via repository directly
    if (command.capacity !== undefined && command.capacity !== room.capacity) {
      changes.before.capacity = room.capacity;
      changes.after.capacity = command.capacity;
    }

    // If no changes, return existing room
    if (Object.keys(changes.after).length === 0) {
      return room;
    }

    const updatedRoom = await this.roomRepository.update(
      Object.assign(room, {
        props: {
          // biome-ignore lint/complexity/useLiteralKeys: props is protected, bracket notation required
          ...room['props'],
          capacity: command.capacity,
          updatedAt: new Date(),
        },
      }),
    );

    await this.auditService.logSuccess(
      {
        action: AuditAction.ROOM_UPDATE,
        entityType: AuditEntityType.ROOM,
        entityId: room.id,
        changes,
        metadata: { roomNumber: room.number },
      },
      {
        actorId: command.actorId,
        actorRole: command.actorRole,
      },
    );

    return updatedRoom;
  }
}
