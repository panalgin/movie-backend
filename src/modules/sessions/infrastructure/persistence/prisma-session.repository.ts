import { Injectable } from '@nestjs/common';
import type { Prisma, TimeSlot as PrismaTimeSlot } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma';
import { TimeSlotEnum } from '../../../movies/domain/value-objects';
import { Session } from '../../domain/entities';
import type {
  FindSessionsOptions,
  ISessionRepository,
} from '../../domain/repositories';

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async reserveSeatsIfAvailable(
    sessionId: string,
    quantity: number,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    const client = tx ?? this.prisma;

    const updatedRows = await client.$executeRaw`
      UPDATE "sessions" AS s
      SET "soldSeats" = s."soldSeats" + ${quantity}
      FROM "rooms" AS r
      WHERE s."id" = ${sessionId}
        AND r."id" = s."roomId"
        AND s."soldSeats" + ${quantity} <= r."capacity"
    `;

    return updatedRows === 1;
  }

  async findById(id: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return null;
    }

    return Session.reconstitute(session.id, {
      movieId: session.movieId,
      roomId: session.roomId,
      date: session.date,
      timeSlot: session.timeSlot as TimeSlotEnum,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  }

  async findAll(options?: FindSessionsOptions): Promise<Session[]> {
    const where: Prisma.SessionWhereInput = {};

    if (options?.movieId) {
      where.movieId = options.movieId;
    }

    if (options?.roomId) {
      where.roomId = options.roomId;
    }

    if (options?.date) {
      where.date = options.date;
    }

    const sessions = await this.prisma.session.findMany({
      where,
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
      skip: options?.skip,
      take: options?.take,
    });

    return sessions.map((session) =>
      Session.reconstitute(session.id, {
        movieId: session.movieId,
        roomId: session.roomId,
        date: session.date,
        timeSlot: session.timeSlot as TimeSlotEnum,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }),
    );
  }

  async findByMovieId(movieId: string): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: { movieId },
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
    });

    return sessions.map((session) =>
      Session.reconstitute(session.id, {
        movieId: session.movieId,
        roomId: session.roomId,
        date: session.date,
        timeSlot: session.timeSlot as TimeSlotEnum,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }),
    );
  }

  async save(session: Session): Promise<Session> {
    const saved = await this.prisma.session.create({
      data: {
        id: session.id,
        movieId: session.movieId,
        roomId: session.roomId,
        date: session.date,
        timeSlot: session.timeSlot as PrismaTimeSlot,
      },
    });

    return Session.reconstitute(saved.id, {
      movieId: saved.movieId,
      roomId: saved.roomId,
      date: saved.date,
      timeSlot: saved.timeSlot as TimeSlotEnum,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    });
  }

  async update(session: Session): Promise<Session> {
    const updated = await this.prisma.session.update({
      where: { id: session.id },
      data: {
        roomId: session.roomId,
        date: session.date,
        timeSlot: session.timeSlot as PrismaTimeSlot,
      },
    });

    return Session.reconstitute(updated.id, {
      movieId: updated.movieId,
      roomId: updated.roomId,
      date: updated.date,
      timeSlot: updated.timeSlot as TimeSlotEnum,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id },
    });
  }

  async existsConflict(
    date: Date,
    timeSlot: TimeSlotEnum,
    roomId: string,
    excludeId?: string,
  ): Promise<boolean> {
    const where: Prisma.SessionWhereInput = {
      date,
      timeSlot: timeSlot as PrismaTimeSlot,
      roomId,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.session.count({ where });
    return count > 0;
  }
}
