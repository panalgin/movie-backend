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
    remainingCapacity: jest.fn().mockReturnValue(40),
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
      saveMany: jest
        .fn()
        .mockImplementation((tickets) => Promise.resolve(tickets)),
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

    // Reset mocks
    mockSession.isPast.mockReturnValue(false);
    mockMovie.canBeWatchedBy.mockReturnValue(true);
    mockRoom.remainingCapacity.mockReturnValue(40);

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

  it('should buy single ticket successfully', async () => {
    const command = new BuyTicketCommand(
      'user-id',
      'session-id',
      1,
      'CUSTOMER',
    );
    const result = await handler.execute(command);

    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('user-id');
    expect(result[0].sessionId).toBe('session-id');
    expect(ticketRepository.saveMany).toHaveBeenCalledWith(
      expect.arrayContaining([expect.any(Ticket)]),
    );
  });

  it('should buy multiple tickets successfully', async () => {
    const command = new BuyTicketCommand(
      'user-id',
      'session-id',
      3,
      'CUSTOMER',
    );
    const result = await handler.execute(command);

    expect(result).toHaveLength(3);
    expect(ticketRepository.saveMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.any(Ticket),
        expect.any(Ticket),
        expect.any(Ticket),
      ]),
    );
  });

  it('should allow same user to buy tickets multiple times', async () => {
    // First purchase
    const command1 = new BuyTicketCommand(
      'user-id',
      'session-id',
      2,
      'CUSTOMER',
    );
    const result1 = await handler.execute(command1);
    expect(result1).toHaveLength(2);

    // Second purchase (same user, same session)
    const command2 = new BuyTicketCommand(
      'user-id',
      'session-id',
      1,
      'CUSTOMER',
    );
    const result2 = await handler.execute(command2);
    expect(result2).toHaveLength(1);
  });

  it('should throw NotFoundException if session not found', async () => {
    sessionRepository.findById.mockResolvedValue(null);

    const command = new BuyTicketCommand(
      'user-id',
      'session-id',
      1,
      'CUSTOMER',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for past session', async () => {
    mockSession.isPast.mockReturnValue(true);

    const command = new BuyTicketCommand(
      'user-id',
      'session-id',
      1,
      'CUSTOMER',
    );

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if movie not found', async () => {
    movieRepository.findById.mockResolvedValue(null);

    const command = new BuyTicketCommand(
      'user-id',
      'session-id',
      1,
      'CUSTOMER',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    const command = new BuyTicketCommand(
      'user-id',
      'session-id',
      1,
      'CUSTOMER',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException for age restriction', async () => {
    mockMovie.canBeWatchedBy.mockReturnValue(false);

    const command = new BuyTicketCommand(
      'user-id',
      'session-id',
      1,
      'CUSTOMER',
    );

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException if room not found', async () => {
    roomRepository.findById.mockResolvedValue(null);

    const command = new BuyTicketCommand(
      'user-id',
      'session-id',
      1,
      'CUSTOMER',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException when not enough seats for quantity', async () => {
    mockRoom.remainingCapacity.mockReturnValue(2);

    const command = new BuyTicketCommand(
      'user-id',
      'session-id',
      5,
      'CUSTOMER',
    );

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    await expect(handler.execute(command)).rejects.toThrow(
      'Not enough seats available',
    );
  });

  it('should throw ConflictException when session is sold out', async () => {
    mockRoom.remainingCapacity.mockReturnValue(0);

    const command = new BuyTicketCommand(
      'user-id',
      'session-id',
      1,
      'CUSTOMER',
    );

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    await expect(handler.execute(command)).rejects.toThrow(
      'Not enough seats available',
    );
  });
});
