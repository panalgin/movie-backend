import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma';
import { Room } from '../../domain/entities';
import type { IRoomRepository } from '../../domain/repositories';

@Injectable()
export class PrismaRoomRepository implements IRoomRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Room | null> {
    const room = await this.prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return null;
    }

    return Room.reconstitute(room.id, {
      number: room.number,
      capacity: room.capacity,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    });
  }

  async findByNumber(number: number): Promise<Room | null> {
    const room = await this.prisma.room.findUnique({
      where: { number },
    });

    if (!room) {
      return null;
    }

    return Room.reconstitute(room.id, {
      number: room.number,
      capacity: room.capacity,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    });
  }

  async findAll(): Promise<Room[]> {
    const rooms = await this.prisma.room.findMany({
      orderBy: { number: 'asc' },
    });

    return rooms.map((room) =>
      Room.reconstitute(room.id, {
        number: room.number,
        capacity: room.capacity,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
      }),
    );
  }

  async save(room: Room): Promise<Room> {
    const saved = await this.prisma.room.create({
      data: {
        id: room.id,
        number: room.number,
        capacity: room.capacity,
      },
    });

    return Room.reconstitute(saved.id, {
      number: saved.number,
      capacity: saved.capacity,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    });
  }

  async update(room: Room): Promise<Room> {
    const updated = await this.prisma.room.update({
      where: { id: room.id },
      data: {
        capacity: room.capacity,
      },
    });

    return Room.reconstitute(updated.id, {
      number: updated.number,
      capacity: updated.capacity,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.room.delete({
      where: { id },
    });
  }

  async existsByNumber(number: number): Promise<boolean> {
    const count = await this.prisma.room.count({
      where: { number },
    });
    return count > 0;
  }
}
