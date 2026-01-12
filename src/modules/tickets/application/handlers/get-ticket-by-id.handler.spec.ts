import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationErrorCode } from '../../../../shared/application';
import { Ticket } from '../../domain/entities';
import { TICKET_REPOSITORY } from '../../domain/repositories';
import { GetTicketByIdQuery } from '../queries';
import { GetTicketByIdHandler } from './get-ticket-by-id.handler';

describe('GetTicketByIdHandler', () => {
  let handler: GetTicketByIdHandler;
  let ticketRepository: Record<string, jest.Mock>;

  const mockTicket = Ticket.reconstitute('ticket-id', {
    userId: 'user-id',
    sessionId: 'session-id',
    purchasedAt: new Date(),
    usedAt: null,
  });

  beforeEach(async () => {
    ticketRepository = {
      findById: jest.fn().mockResolvedValue(mockTicket),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTicketByIdHandler,
        { provide: TICKET_REPOSITORY, useValue: ticketRepository },
      ],
    }).compile();

    handler = module.get<GetTicketByIdHandler>(GetTicketByIdHandler);
  });

  it('should return ticket by id for owner', async () => {
    const query = new GetTicketByIdQuery('ticket-id', 'user-id');

    const result = await handler.execute(query);

    expect(result).toBeDefined();
    expect(result.id).toBe('ticket-id');
    expect(ticketRepository.findById).toHaveBeenCalledWith('ticket-id');
  });

  it('should throw ApplicationException if ticket not found', async () => {
    ticketRepository.findById.mockResolvedValue(null);

    const query = new GetTicketByIdQuery('non-existent-id', 'user-id');

    await expect(handler.execute(query)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.TICKET_NOT_FOUND,
      }),
    );
  });

  it('should throw ApplicationException if ticket belongs to different user', async () => {
    const query = new GetTicketByIdQuery('ticket-id', 'different-user-id');

    await expect(handler.execute(query)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.TICKET_NOT_OWNED,
      }),
    );
  });
});
