import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { AuditService } from '../../../audit/application';
import { AuditAction, AuditEntityType } from '../../../audit/domain/enums';
import type { IUserRepository } from '../../../auth/domain/repositories';
import { USER_REPOSITORY } from '../../../auth/domain/repositories';
import type { IMovieRepository } from '../../../movies/domain/repositories';
import { MOVIE_REPOSITORY } from '../../../movies/domain/repositories';
import { NotificationService } from '../../../notifications/application';
import {
  NotificationChannel,
  NotificationType,
} from '../../../notifications/domain/enums';
import type { ISessionRepository } from '../../../sessions/domain/repositories';
import { SESSION_REPOSITORY } from '../../../sessions/domain/repositories';
import { Ticket } from '../../domain/entities';
import type { ITicketRepository } from '../../domain/repositories';
import { TICKET_REPOSITORY } from '../../domain/repositories';
import { BuyTicketCommand } from '../commands';

@CommandHandler(BuyTicketCommand)
export class BuyTicketHandler implements ICommandHandler<BuyTicketCommand> {
  private readonly logger = new Logger(BuyTicketHandler.name);

  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepository: ISessionRepository,
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly auditService: AuditService,
    private readonly notificationService: NotificationService,
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

    const saved = await this.ticketRepository.save(ticket);

    await this.auditService.logSuccess(
      {
        action: AuditAction.TICKET_PURCHASE,
        entityType: AuditEntityType.TICKET,
        entityId: saved.id,
        metadata: {
          sessionId: session.id,
          movieId: movie.id,
          movieTitle: movie.title,
          sessionDate: session.date,
          timeSlot: session.timeSlot,
        },
      },
      {
        actorId: command.userId,
        actorRole: command.actorRole,
      },
    );

    // Send notification (async, non-blocking)
    this.sendPurchaseNotification(user.email, {
      movieTitle: movie.title,
      sessionDate: session.date.toISOString().split('T')[0],
      timeSlot: session.timeSlot,
      roomNumber: session.roomNumber,
      ticketId: saved.id,
    }).catch((error) => {
      this.logger.error('Failed to send ticket notification', error);
    });

    return saved;
  }

  private async sendPurchaseNotification(
    email: string,
    data: {
      movieTitle: string;
      sessionDate: string;
      timeSlot: string;
      roomNumber: number;
      ticketId: string;
    },
  ): Promise<void> {
    await this.notificationService.send({
      type: NotificationType.TICKET_PURCHASED,
      channels: [NotificationChannel.EMAIL],
      recipient: { email },
      data,
    });
  }
}
