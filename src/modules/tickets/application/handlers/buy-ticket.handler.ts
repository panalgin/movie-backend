import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { IUserRepository } from '../../../auth/domain/repositories';
import { USER_REPOSITORY } from '../../../auth/domain/repositories';
import type { IMovieRepository } from '../../../movies/domain/repositories';
import { MOVIE_REPOSITORY } from '../../../movies/domain/repositories';
import type { ISessionRepository } from '../../../sessions/domain/repositories';
import { SESSION_REPOSITORY } from '../../../sessions/domain/repositories';
import { Ticket } from '../../domain/entities';
import type { ITicketRepository } from '../../domain/repositories';
import { TICKET_REPOSITORY } from '../../domain/repositories';
import { BuyTicketCommand } from '../commands';

@CommandHandler(BuyTicketCommand)
export class BuyTicketHandler implements ICommandHandler<BuyTicketCommand> {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: BuyTicketCommand): Promise<Ticket> {
    // Check if session exists
    const session = await this.sessionRepository.findById(command.sessionId);
    if (!session) {
      throw new NotFoundException(
        `Session with ID ${command.sessionId} not found`,
      );
    }

    // Check if session is not in the past
    if (session.isPast()) {
      throw new BadRequestException('Cannot buy ticket for a past session');
    }

    // Get the movie for age restriction check
    const movie = await this.movieRepository.findById(session.movieId);
    if (!movie) {
      throw new NotFoundException('Movie not found for this session');
    }

    // Get user for age check
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check age restriction
    if (!movie.canBeWatchedBy(user.age)) {
      throw new ForbiddenException(
        `You must be at least ${movie.ageRestriction} years old to buy a ticket for this movie`,
      );
    }

    // Check if user already has a ticket for this session
    const existingTicket = await this.ticketRepository.existsByUserAndSession(
      command.userId,
      command.sessionId,
    );
    if (existingTicket) {
      throw new ConflictException('You already have a ticket for this session');
    }

    const ticket = Ticket.create({
      userId: command.userId,
      sessionId: command.sessionId,
    });

    return this.ticketRepository.save(ticket);
  }
}
