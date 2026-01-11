import { Ticket } from '../entities';

export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY');

export interface ITicketRepository {
  findById(id: string): Promise<Ticket | null>;
  findByUserId(userId: string): Promise<Ticket[]>;
  findBySessionId(sessionId: string): Promise<Ticket[]>;
  findByUserAndSession(
    userId: string,
    sessionId: string,
  ): Promise<Ticket | null>;
  save(ticket: Ticket): Promise<Ticket>;
  existsByUserAndSession(userId: string, sessionId: string): Promise<boolean>;
}
