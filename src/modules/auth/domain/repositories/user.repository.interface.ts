import { User } from '../entities';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  save(user: User): Promise<User>;
  existsByEmail(email: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
}
