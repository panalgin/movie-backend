import { Test, type TestingModule } from '@nestjs/testing';
import { Ticket } from '../../domain/entities';
import { TICKET_REPOSITORY } from '../../domain/repositories';
import { GetMyTicketsQuery } from '../queries';
import { GetMyTicketsHandler } from './get-my-tickets.handler';

describe('GetMyTicketsHandler', () => {
  let handler: GetMyTicketsHandler;
  let ticketRepository: Record<string, jest.Mock>;

  const mockTickets = [
    Ticket.reconstitute('ticket-1', {
      userId: 'user-id',
      sessionId: 'session-1',
      purchasedAt: new Date(),
      usedAt: null,
    }),
    Ticket.reconstitute('ticket-2', {
      userId: 'user-id',
      sessionId: 'session-2',
      purchasedAt: new Date(),
      usedAt: new Date(),
    }),
  ];

  beforeEach(async () => {
    ticketRepository = {
      findByUserId: jest.fn().mockResolvedValue(mockTickets),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyTicketsHandler,
        { provide: TICKET_REPOSITORY, useValue: ticketRepository },
      ],
    }).compile();

    handler = module.get<GetMyTicketsHandler>(GetMyTicketsHandler);
  });

  it('should return tickets for user', async () => {
    const query = new GetMyTicketsQuery('user-id');

    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(ticketRepository.findByUserId).toHaveBeenCalledWith('user-id');
  });

  it('should return empty array if user has no tickets', async () => {
    ticketRepository.findByUserId.mockResolvedValue([]);

    const query = new GetMyTicketsQuery('user-with-no-tickets');

    const result = await handler.execute(query);

    expect(result).toHaveLength(0);
  });
});
