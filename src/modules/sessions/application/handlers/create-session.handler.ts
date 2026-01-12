import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import { AuditService } from '../../../audit/application';
import { AuditAction, AuditEntityType } from '../../../audit/domain/enums';
import type { IMovieRepository } from '../../../movies/domain/repositories';
import { MOVIE_REPOSITORY } from '../../../movies/domain/repositories';
import { Session } from '../../domain/entities';
import type {
  IRoomRepository,
  ISessionRepository,
} from '../../domain/repositories';
import { ROOM_REPOSITORY, SESSION_REPOSITORY } from '../../domain/repositories';
import { CreateSessionCommand } from '../commands';

@CommandHandler(CreateSessionCommand)
export class CreateSessionHandler
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(command: CreateSessionCommand): Promise<Session> {
    // Check if movie exists
    const movie = await this.movieRepository.findById(command.movieId);
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${command.movieId} not found`);
    }

    // Check if room exists
    const room = await this.roomRepository.findById(command.roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${command.roomId} not found`);
    }

    // Check for double-booking
    const hasConflict = await this.sessionRepository.existsConflict(
      command.date,
      command.timeSlot,
      command.roomId,
    );

    if (hasConflict) {
      throw new ConflictException(
        `Room ${room.number} is already booked for this time slot on this date`,
      );
    }

    const session = Session.create({
      movieId: command.movieId,
      roomId: command.roomId,
      date: command.date,
      timeSlot: command.timeSlot,
    });

    try {
      const saved = await this.sessionRepository.save(session);

      await this.auditService.logSuccess(
        {
          action: AuditAction.SESSION_CREATE,
          entityType: AuditEntityType.SESSION,
          entityId: saved.id,
          changes: {
            after: {
              movieId: saved.movieId,
              roomId: saved.roomId,
              date: saved.date,
              timeSlot: saved.timeSlot,
            },
          },
          metadata: { movieTitle: movie.title, roomNumber: room.number },
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
        throw new ConflictException(
          `Room ${room.number} is already booked for this time slot on this date`,
        );
      }
      throw error;
    }
  }
}
