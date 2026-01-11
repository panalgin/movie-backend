import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma';
import { WatchHistory } from '../../domain/entities';
import type { IWatchHistoryRepository } from '../../domain/repositories';

@Injectable()
export class PrismaWatchHistoryRepository implements IWatchHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<WatchHistory | null> {
    const watchHistory = await this.prisma.watchHistory.findUnique({
      where: { id },
    });

    if (!watchHistory) {
      return null;
    }

    return WatchHistory.reconstitute(watchHistory.id, {
      userId: watchHistory.userId,
      movieId: watchHistory.movieId,
      watchedAt: watchHistory.watchedAt,
    });
  }

  async findByUserId(userId: string): Promise<WatchHistory[]> {
    const watchHistories = await this.prisma.watchHistory.findMany({
      where: { userId },
      orderBy: { watchedAt: 'desc' },
    });

    return watchHistories.map((wh) =>
      WatchHistory.reconstitute(wh.id, {
        userId: wh.userId,
        movieId: wh.movieId,
        watchedAt: wh.watchedAt,
      }),
    );
  }

  async save(watchHistory: WatchHistory): Promise<WatchHistory> {
    const saved = await this.prisma.watchHistory.create({
      data: {
        id: watchHistory.id,
        userId: watchHistory.userId,
        movieId: watchHistory.movieId,
        watchedAt: watchHistory.watchedAt,
      },
    });

    return WatchHistory.reconstitute(saved.id, {
      userId: saved.userId,
      movieId: saved.movieId,
      watchedAt: saved.watchedAt,
    });
  }
}
