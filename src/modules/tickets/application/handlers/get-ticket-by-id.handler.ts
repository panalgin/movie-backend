import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationErrorCode,
  ApplicationException,
} from '../../../../shared/application';
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
      throw new ApplicationException(
        ApplicationErrorCode.TICKET_NOT_FOUND,
        `Ticket with ID ${query.id} not found`,
        { ticketId: query.id },
      );
    }

    if (!ticket.belongsTo(query.userId)) {
      throw new ApplicationException(
        ApplicationErrorCode.TICKET_NOT_OWNED,
        'This ticket does not belong to you',
        { ticketId: query.id, userId: query.userId },
      );
    }

    return ticket;
  }
}
