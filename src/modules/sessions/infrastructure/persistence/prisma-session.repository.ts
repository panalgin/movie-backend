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

  async findById(id: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { id },
    });

    if (!session) {
      return null;
    }

    return Session.reconstitute(session.id, {
      movieId: session.movieId,
      date: session.date,
      timeSlot: session.timeSlot as TimeSlotEnum,
      roomNumber: session.roomNumber,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  }

  async findAll(options?: FindSessionsOptions): Promise<Session[]> {
    const where: Prisma.SessionWhereInput = {};

    if (options?.movieId) {
      where.movieId = options.movieId;
    }

    if (options?.date) {
      where.date = options.date;
    }

    if (options?.roomNumber) {
      where.roomNumber = options.roomNumber;
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
        date: session.date,
        timeSlot: session.timeSlot as TimeSlotEnum,
        roomNumber: session.roomNumber,
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
        date: session.date,
        timeSlot: session.timeSlot as TimeSlotEnum,
        roomNumber: session.roomNumber,
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
        date: session.date,
        timeSlot: session.timeSlot as PrismaTimeSlot,
        roomNumber: session.roomNumber,
      },
    });

    return Session.reconstitute(saved.id, {
      movieId: saved.movieId,
      date: saved.date,
      timeSlot: saved.timeSlot as TimeSlotEnum,
      roomNumber: saved.roomNumber,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
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
    roomNumber: number,
    excludeId?: string,
  ): Promise<boolean> {
    const where: Prisma.SessionWhereInput = {
      date,
      timeSlot: timeSlot as PrismaTimeSlot,
      roomNumber,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await this.prisma.session.count({ where });
    return count > 0;
  }
}
