import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Ticket } from '../../domain/entities';
import type { ITicketRepository } from '../../domain/repositories';
import { TICKET_REPOSITORY } from '../../domain/repositories';
import { GetMyTicketsQuery } from '../queries';

@QueryHandler(GetMyTicketsQuery)
export class GetMyTicketsHandler implements IQueryHandler<GetMyTicketsQuery> {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(query: GetMyTicketsQuery): Promise<Ticket[]> {
    return this.ticketRepository.findByUserId(query.userId);
  }
}
