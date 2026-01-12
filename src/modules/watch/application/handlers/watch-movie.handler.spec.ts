import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { SESSION_REPOSITORY } from '../../../sessions/domain/repositories';
import { TICKET_REPOSITORY } from '../../../tickets/domain/repositories';
import { WATCH_HISTORY_REPOSITORY } from '../../domain/repositories';
import { WatchMovieCommand } from '../commands';
import { WatchMovieHandler } from './watch-movie.handler';

describe('WatchMovieHandler', () => {
  let handler: WatchMovieHandler;
  let watchHistoryRepository: Record<string, jest.Mock>;
  let ticketRepository: Record<string, jest.Mock>;
  let sessionRepository: Record<string, jest.Mock>;

  const mockTicket = {
    id: 'ticket-id',
    userId: 'user-id',
    sessionId: 'session-id',
    belongsTo: jest.fn().mockReturnValue(true),
  };

  const mockSession = {
    id: 'session-id',
    movieId: 'movie-id',
  };

  beforeEach(async () => {
    watchHistoryRepository = {
      save: jest.fn().mockImplementation((watchHistory) =>
        Promise.resolve(watchHistory),
      ),
    };

    ticketRepository = {
      findById: jest.fn().mockResolvedValue(mockTicket),
    };

    sessionRepository = {
      findById: jest.fn().mockResolvedValue(mockSession),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WatchMovieHandler,
        { provide: WATCH_HISTORY_REPOSITORY, useValue: watchHistoryRepository },
        { provide: TICKET_REPOSITORY, useValue: ticketRepository },
        { provide: SESSION_REPOSITORY, useValue: sessionRepository },
      ],
    }).compile();

    handler = module.get<WatchMovieHandler>(WatchMovieHandler);
  });

  it('should create watch history successfully', async () => {
    const command = new WatchMovieCommand('user-id', 'ticket-id');

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.userId).toBe('user-id');
    expect(result.movieId).toBe('movie-id');
    expect(watchHistoryRepository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if ticket not found', async () => {
    ticketRepository.findById.mockResolvedValue(null);

    const command = new WatchMovieCommand('user-id', 'ticket-id');

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    await expect(handler.execute(command)).rejects.toThrow(
      'Ticket with ID ticket-id not found',
    );
  });

  it('should throw ForbiddenException if ticket does not belong to user', async () => {
    mockTicket.belongsTo.mockReturnValue(false);
    ticketRepository.findById.mockResolvedValue(mockTicket);

    const command = new WatchMovieCommand('different-user-id', 'ticket-id');

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
    await expect(handler.execute(command)).rejects.toThrow(
      'This ticket does not belong to you',
    );

    mockTicket.belongsTo.mockReturnValue(true);
  });

  it('should throw NotFoundException if session not found', async () => {
    sessionRepository.findById.mockResolvedValue(null);

    const command = new WatchMovieCommand('user-id', 'ticket-id');

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    await expect(handler.execute(command)).rejects.toThrow(
      'Session not found for this ticket',
    );
  });
});
