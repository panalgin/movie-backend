import { Inject, Logger } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { RedisService } from '../../../../shared/infrastructure';
import type { Movie } from '../../domain/entities';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { GetMoviesQuery } from '../queries';

const CACHE_TTL_MS = 30000; // 30 seconds

@QueryHandler(GetMoviesQuery)
export class GetMoviesHandler implements IQueryHandler<GetMoviesQuery> {
  private readonly logger = new Logger(GetMoviesHandler.name);

  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
    private readonly redis: RedisService,
  ) {}

  async execute(query: GetMoviesQuery): Promise<Movie[]> {
    const cacheKey = this.buildCacheKey(query);

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const start = Date.now();

        // Simulated slow query (remove in production)
        await new Promise((resolve) => setTimeout(resolve, 150));

        const result = await this.movieRepository.findAll({
          skip: query.skip,
          take: query.take,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          filterByAgeRestriction: query.filterByAgeRestriction,
        });

        this.logger.warn(
          `Cache miss - database query executed in ${Date.now() - start}ms`,
        );

        return result;
      },
      CACHE_TTL_MS,
      {
        lockTtlMs: 5000, // Lock expires after 5s (safety)
        jitterMs: 100, // Random 0-100ms delay before lock attempt
        maxWaitMs: 1000, // Max wait for cache to be filled
        retryIntervalMs: 50, // Poll cache every 50ms
      },
    );
  }

  private buildCacheKey(query: GetMoviesQuery): string {
    return `movies:list:${query.skip ?? 0}:${query.take ?? 10}:${query.sortBy ?? 'createdAt'}:${query.sortOrder ?? 'desc'}:${query.filterByAgeRestriction ?? 'all'}`;
  }
}
