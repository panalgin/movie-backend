import { ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Prisma } from '@prisma/client';
import type { IMovieRepository } from '../../../movies/domain/repositories';
import { MOVIE_REPOSITORY } from '../../../movies/domain/repositories';
import { Session } from '../../domain/entities';
import type { ISessionRepository } from '../../domain/repositories';
import { SESSION_REPOSITORY } from '../../domain/repositories';
import { CreateSessionCommand } from '../commands';

@CommandHandler(CreateSessionCommand)
export class CreateSessionHandler
  implements ICommandHandler<CreateSessionCommand>
{
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
  ) {}

  async execute(command: CreateSessionCommand): Promise<Session> {
    // Check if movie exists
    const movie = await this.movieRepository.findById(command.movieId);
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${command.movieId} not found`);
    }

    // Check for double-booking
    const hasConflict = await this.sessionRepository.existsConflict(
      command.date,
      command.timeSlot,
      command.roomNumber,
    );

    if (hasConflict) {
      throw new ConflictException(
        `Room ${command.roomNumber} is already booked for this time slot on this date`,
      );
    }

    const session = Session.create({
      movieId: command.movieId,
      date: command.date,
      timeSlot: command.timeSlot,
      roomNumber: command.roomNumber,
    });

    try {
      return await this.sessionRepository.save(session);
    } catch (error) {
      // Handle unique constraint violation (double-booking at DB level)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Room ${command.roomNumber} is already booked for this time slot on this date`,
        );
      }
      throw error;
    }
  }
}
