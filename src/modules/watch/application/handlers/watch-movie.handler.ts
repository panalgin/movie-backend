import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { ISessionRepository } from '../../../sessions/domain/repositories';
import { SESSION_REPOSITORY } from '../../../sessions/domain/repositories';
import type { ITicketRepository } from '../../../tickets/domain/repositories';
import { TICKET_REPOSITORY } from '../../../tickets/domain/repositories';
import { WatchHistory } from '../../domain/entities';
import type { IWatchHistoryRepository } from '../../domain/repositories';
import { WATCH_HISTORY_REPOSITORY } from '../../domain/repositories';
import { WatchMovieCommand } from '../commands';

@CommandHandler(WatchMovieCommand)
export class WatchMovieHandler implements ICommandHandler<WatchMovieCommand> {
  constructor(
    @Inject(WATCH_HISTORY_REPOSITORY)
    private readonly watchHistoryRepository: IWatchHistoryRepository,
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(command: WatchMovieCommand): Promise<WatchHistory> {
    // Check if ticket exists
    const ticket = await this.ticketRepository.findById(command.ticketId);
    if (!ticket) {
      throw new NotFoundException(
        `Ticket with ID ${command.ticketId} not found`,
      );
    }

    // Check if ticket belongs to user
    if (!ticket.belongsTo(command.userId)) {
      throw new ForbiddenException('This ticket does not belong to you');
    }

    // Get session to get movie ID
    const session = await this.sessionRepository.findById(ticket.sessionId);
    if (!session) {
      throw new NotFoundException('Session not found for this ticket');
    }

    // Create watch history entry
    const watchHistory = WatchHistory.create({
      userId: command.userId,
      movieId: session.movieId,
    });

    return this.watchHistoryRepository.save(watchHistory);
  }
}
