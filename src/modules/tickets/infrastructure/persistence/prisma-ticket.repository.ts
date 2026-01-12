import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma';
import { Ticket } from '../../domain/entities';
import type { ITicketRepository } from '../../domain/repositories';

@Injectable()
export class PrismaTicketRepository implements ITicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return null;
    }

    return Ticket.reconstitute(ticket.id, {
      userId: ticket.userId,
      sessionId: ticket.sessionId,
      purchasedAt: ticket.purchasedAt,
    });
  }

  async findByUserId(userId: string): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      orderBy: { purchasedAt: 'desc' },
    });

    return tickets.map((ticket) =>
      Ticket.reconstitute(ticket.id, {
        userId: ticket.userId,
        sessionId: ticket.sessionId,
        purchasedAt: ticket.purchasedAt,
      }),
    );
  }

  async findBySessionId(sessionId: string): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { sessionId },
      orderBy: { purchasedAt: 'desc' },
    });

    return tickets.map((ticket) =>
      Ticket.reconstitute(ticket.id, {
        userId: ticket.userId,
        sessionId: ticket.sessionId,
        purchasedAt: ticket.purchasedAt,
      }),
    );
  }

  async findByUserAndSession(
    userId: string,
    sessionId: string,
  ): Promise<Ticket | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    });

    if (!ticket) {
      return null;
    }

    return Ticket.reconstitute(ticket.id, {
      userId: ticket.userId,
      sessionId: ticket.sessionId,
      purchasedAt: ticket.purchasedAt,
    });
  }

  async save(ticket: Ticket): Promise<Ticket> {
    const saved = await this.prisma.ticket.create({
      data: {
        id: ticket.id,
        userId: ticket.userId,
        sessionId: ticket.sessionId,
        purchasedAt: ticket.purchasedAt,
      },
    });

    return Ticket.reconstitute(saved.id, {
      userId: saved.userId,
      sessionId: saved.sessionId,
      purchasedAt: saved.purchasedAt,
    });
  }

  async existsByUserAndSession(
    userId: string,
    sessionId: string,
  ): Promise<boolean> {
    const count = await this.prisma.ticket.count({
      where: { userId, sessionId },
    });
    return count > 0;
  }

  async countBySessionId(sessionId: string): Promise<number> {
    return this.prisma.ticket.count({
      where: { sessionId },
    });
  }
}
