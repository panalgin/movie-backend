import { BuyTicketHandler } from './buy-ticket.handler';
import { GetMyTicketsHandler } from './get-my-tickets.handler';
import { GetTicketByIdHandler } from './get-ticket-by-id.handler';

export const CommandHandlers = [BuyTicketHandler];

export const QueryHandlers = [GetMyTicketsHandler, GetTicketByIdHandler];

export { BuyTicketHandler, GetMyTicketsHandler, GetTicketByIdHandler };
