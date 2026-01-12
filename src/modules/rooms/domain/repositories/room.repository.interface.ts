import type { Room } from '../entities';

export const ROOM_REPOSITORY = Symbol('ROOM_REPOSITORY');

export interface IRoomRepository {
  findById(id: string): Promise<Room | null>;
  findByNumber(number: number): Promise<Room | null>;
  findAll(): Promise<Room[]>;
  save(room: Room): Promise<Room>;
  update(room: Room): Promise<Room>;
  delete(id: string): Promise<void>;
  existsByNumber(number: number): Promise<boolean>;
}
