import type { TimeSlotEnum } from '../../../movies/domain/value-objects';
import { Session } from '../entities';

export const SESSION_REPOSITORY = Symbol('SESSION_REPOSITORY');

export interface FindSessionsOptions {
  movieId?: string;
  date?: Date;
  roomNumber?: number;
  skip?: number;
  take?: number;
}

export interface ISessionRepository {
  findById(id: string): Promise<Session | null>;
  findAll(options?: FindSessionsOptions): Promise<Session[]>;
  findByMovieId(movieId: string): Promise<Session[]>;
  save(session: Session): Promise<Session>;
  delete(id: string): Promise<void>;
  existsConflict(
    date: Date,
    timeSlot: TimeSlotEnum,
    roomNumber: number,
    excludeId?: string,
  ): Promise<boolean>;
}
