import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import {
  ApplicationErrorCode,
  ApplicationException,
} from '../../../../shared/application';
import { AuditService } from '../../../audit/application';
import { AuditAction, AuditEntityType } from '../../../audit/domain/enums';
import type { Session } from '../../domain/entities';
import type {
  IRoomRepository,
  ISessionRepository,
} from '../../domain/repositories';
import { ROOM_REPOSITORY, SESSION_REPOSITORY } from '../../domain/repositories';
import { UpdateSessionCommand } from '../commands';

@CommandHandler(UpdateSessionCommand)
export class UpdateSessionHandler
  implements ICommandHandler<UpdateSessionCommand>
{
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(command: UpdateSessionCommand): Promise<Session> {
    // Check if session exists
    const session = await this.sessionRepository.findById(command.id);
    if (!session) {
      throw new ApplicationException(
        ApplicationErrorCode.SESSION_NOT_FOUND,
        `Session with ID ${command.id} not found`,
        { sessionId: command.id },
      );
    }

    // If roomId is being changed, verify the new room exists
    let roomNumber = 0;
    if (command.roomId && command.roomId !== session.roomId) {
      const room = await this.roomRepository.findById(command.roomId);
      if (!room) {
        throw new ApplicationException(
          ApplicationErrorCode.ROOM_NOT_FOUND,
          `Room with ID ${command.roomId} not found`,
          { roomId: command.roomId },
        );
      }
      roomNumber = room.number;
    }

    // Determine the values that will be used for conflict check
    const newRoomId = command.roomId ?? session.roomId;
    const newDate = command.date ?? session.date;
    const newTimeSlot = command.timeSlot ?? session.timeSlot;

    // Check for double-booking (excluding current session)
    const hasConflict = await this.sessionRepository.existsConflict(
      newDate,
      newTimeSlot,
      newRoomId,
      command.id, // exclude current session
    );

    if (hasConflict) {
      throw new ApplicationException(
        ApplicationErrorCode.SESSION_CONFLICT,
        'This room is already booked for this time slot on this date',
        { roomId: newRoomId, date: newDate, timeSlot: newTimeSlot },
      );
    }

    // Update the session
    const updatedSession = session.update({
      roomId: command.roomId,
      date: command.date,
      timeSlot: command.timeSlot,
    });

    try {
      const saved = await this.sessionRepository.update(updatedSession);

      await this.auditService.logSuccess(
        {
          action: AuditAction.SESSION_UPDATE,
          entityType: AuditEntityType.SESSION,
          entityId: saved.id,
          changes: {
            before: {
              roomId: session.roomId,
              date: session.date,
              timeSlot: session.timeSlot,
            },
            after: {
              roomId: saved.roomId,
              date: saved.date,
              timeSlot: saved.timeSlot,
            },
          },
          metadata: roomNumber ? { roomNumber } : undefined,
        },
        {
          actorId: command.actorId,
          actorRole: command.actorRole,
        },
      );

      return saved;
    } catch (error) {
      // Handle unique constraint violation (double-booking at DB level)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ApplicationException(
          ApplicationErrorCode.SESSION_CONFLICT,
          'This room is already booked for this time slot on this date',
          { roomId: newRoomId, date: newDate, timeSlot: newTimeSlot },
        );
      }
      throw error;
    }
  }
}
