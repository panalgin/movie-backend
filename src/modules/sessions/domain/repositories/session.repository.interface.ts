import type { Prisma } from '@prisma/client';
import type { TimeSlotEnum } from '../../../movies/domain/value-objects';
import type { Session } from '../entities';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface FindSessionsOptions {
  movieId?: string;
  roomId?: string;
  date?: Date;
  skip?: number;
  take?: number;
}

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  findAll(options?: FindSessionsOptions): Promise<Session[]>;
  findByMovieId(movieId: string): Promise<Session[]>;
  save(session: Session): Promise<Session>;
  update(session: Session): Promise<Session>;
  delete(id: string): Promise<void>;
  /**
   * Atomically increments soldSeats if capacity allows.
   * Returns true if seats were reserved, false if sold out.
   */
  reserveSeatsIfAvailable(
    sessionId: string,
    quantity: number,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean>;
  existsConflict(
    date: Date,
    timeSlot: TimeSlotEnum,
    roomId: string,
    excludeId?: string,
  ): Promise<boolean>;
}
