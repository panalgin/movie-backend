import { ForbiddenException, Inject, NotFoundException } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Ticket } from '../../domain/entities';
import type { ITicketRepository } from '../../domain/repositories';
import { TICKET_REPOSITORY } from '../../domain/repositories';
import { GetTicketByIdQuery } from '../queries';

@QueryHandler(GetTicketByIdQuery)
export class GetTicketByIdHandler implements IQueryHandler<GetTicketByIdQuery> {
  constructor(
    @Inject(TICKET_REPOSITORY)
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(query: GetTicketByIdQuery): Promise<Ticket> {
    const ticket = await this.ticketRepository.findById(query.id);

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${query.id} not found`);
    }

    if (!ticket.belongsTo(query.userId)) {
      throw new ForbiddenException('This ticket does not belong to you');
    }

    return ticket;
  }
}
