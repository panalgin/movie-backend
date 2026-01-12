import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { AuditService } from '../../../audit/application';
import { USER_REPOSITORY } from '../../../auth/domain/repositories';
import { MOVIE_REPOSITORY } from '../../../movies/domain/repositories';
import { NotificationService } from '../../../notifications/application';
import {
  ROOM_REPOSITORY,
  SESSION_REPOSITORY,
} from '../../../sessions/domain/repositories';
import { Ticket } from '../../domain/entities';
import { TICKET_REPOSITORY } from '../../domain/repositories';
import { BuyTicketCommand } from '../commands';
import { BuyTicketHandler } from './buy-ticket.handler';

describe('BuyTicketHandler', () => {
  let handler: BuyTicketHandler;
  let ticketRepository: Record<string, jest.Mock>;
  let sessionRepository: Record<string, jest.Mock>;
  let roomRepository: Record<string, jest.Mock>;
  let movieRepository: Record<string, jest.Mock>;
  let userRepository: Record<string, jest.Mock>;

  const mockSession = {
    id: 'session-id',
    movieId: 'movie-id',
    roomId: 'room-id',
    date: new Date('2030-01-01'),
    timeSlot: 'SLOT_14_16',
    isPast: jest.fn().mockReturnValue(false),
  };

  const mockRoom = {
    id: 'room-id',
    number: 1,
    capacity: 50,
    hasCapacityFor: jest.fn().mockReturnValue(true),
  };

  const mockMovie = {
    id: 'movie-id',
    title: 'Test Movie',
    ageRestriction: 13,
    canBeWatchedBy: jest.fn().mockReturnValue(true),
  };

  const mockUser = {
    id: 'user-id',
    email: 'test@test.com',
    age: 25,
  };

  beforeEach(async () => {
    ticketRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      existsByUserAndSession: jest.fn().mockResolvedValue(false),
      countBySessionId: jest.fn().mockResolvedValue(10),
    };

    sessionRepository = {
      findById: jest.fn().mockResolvedValue(mockSession),
    };

    roomRepository = {
      findById: jest.fn().mockResolvedValue(mockRoom),
    };

    movieRepository = {
      findById: jest.fn().mockResolvedValue(mockMovie),
    };

    userRepository = {
      findById: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuyTicketHandler,
        { provide: TICKET_REPOSITORY, useValue: ticketRepository },
        { provide: SESSION_REPOSITORY, useValue: sessionRepository },
        { provide: ROOM_REPOSITORY, useValue: roomRepository },
        { provide: MOVIE_REPOSITORY, useValue: movieRepository },
        { provide: USER_REPOSITORY, useValue: userRepository },
        {
          provide: AuditService,
          useValue: { logSuccess: jest.fn(), logFailure: jest.fn() },
        },
        {
          provide: NotificationService,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    handler = module.get<BuyTicketHandler>(BuyTicketHandler);
  });

  it('should buy ticket successfully', async () => {
    const savedTicket = Ticket.create({
      userId: 'user-id',
      sessionId: 'session-id',
    });
    ticketRepository.save.mockResolvedValue(savedTicket);

    const command = new BuyTicketCommand('user-id', 'session-id', 'CUSTOMER');
    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.userId).toBe('user-id');
    expect(result.sessionId).toBe('session-id');
    expect(ticketRepository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if session not found', async () => {
    sessionRepository.findById.mockResolvedValue(null);

    const command = new BuyTicketCommand('user-id', 'session-id', 'CUSTOMER');

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for past session', async () => {
    mockSession.isPast.mockReturnValue(true);
    sessionRepository.findById.mockResolvedValue(mockSession);

    const command = new BuyTicketCommand('user-id', 'session-id', 'CUSTOMER');

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);

    mockSession.isPast.mockReturnValue(false);
  });

  it('should throw NotFoundException if movie not found', async () => {
    movieRepository.findById.mockResolvedValue(null);

    const command = new BuyTicketCommand('user-id', 'session-id', 'CUSTOMER');

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    const command = new BuyTicketCommand('user-id', 'session-id', 'CUSTOMER');

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException for age restriction', async () => {
    mockMovie.canBeWatchedBy.mockReturnValue(false);
    movieRepository.findById.mockResolvedValue(mockMovie);

    const command = new BuyTicketCommand('user-id', 'session-id', 'CUSTOMER');

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);

    mockMovie.canBeWatchedBy.mockReturnValue(true);
  });

  it('should throw NotFoundException if room not found', async () => {
    roomRepository.findById.mockResolvedValue(null);

    const command = new BuyTicketCommand('user-id', 'session-id', 'CUSTOMER');

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when session is sold out', async () => {
    mockRoom.hasCapacityFor.mockReturnValue(false);
    roomRepository.findById.mockResolvedValue(mockRoom);

    const command = new BuyTicketCommand('user-id', 'session-id', 'CUSTOMER');

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    await expect(handler.execute(command)).rejects.toThrow(
      'Session is sold out',
    );

    mockRoom.hasCapacityFor.mockReturnValue(true);
  });

  it('should throw ConflictException for duplicate ticket', async () => {
    ticketRepository.existsByUserAndSession.mockResolvedValue(true);

    const command = new BuyTicketCommand('user-id', 'session-id', 'CUSTOMER');

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    await expect(handler.execute(command)).rejects.toThrow(
      'You already have a ticket for this session',
    );
  });
});
