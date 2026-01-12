import type { Ticket } from '../entities';

export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY');

export interface ITicketRepository {
  findById(id: string): Promise<Ticket | null>;
  findByUserId(userId: string): Promise<Ticket[]>;
  findBySessionId(sessionId: string): Promise<Ticket[]>;
  findByUserAndSession(userId: string, sessionId: string): Promise<Ticket[]>;
  save(ticket: Ticket): Promise<Ticket>;
  saveMany(tickets: Ticket[]): Promise<Ticket[]>;
  countBySessionId(sessionId: string): Promise<number>;
}
