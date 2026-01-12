import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma';
import { User, UserRole } from '../../domain/entities';
import type { IUserRepository } from '../../domain/repositories';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return User.reconstitute(user.id, {
      username: user.username,
      email: user.email,
      phone: user.phone,
      age: user.age,
      role: user.role as UserRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return User.reconstitute(user.id, {
      username: user.username,
      email: user.email,
      phone: user.phone,
      age: user.age,
      role: user.role as UserRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return null;
    }

    return User.reconstitute(user.id, {
      username: user.username,
      email: user.email,
      phone: user.phone,
      age: user.age,
      role: user.role as UserRole,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async save(user: User): Promise<User> {
    const saved = await this.prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        age: user.age,
        role: user.role,
      },
    });

    return User.reconstitute(saved.id, {
      username: saved.username,
      email: saved.email,
      phone: saved.phone,
      age: saved.age,
      role: saved.role as UserRole,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { username },
    });
    return count > 0;
  }
}
