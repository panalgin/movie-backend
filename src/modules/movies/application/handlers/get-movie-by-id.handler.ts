import { Inject, Logger } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ApplicationErrorCode,
  ApplicationException,
} from '../../../../shared/application';
import { RedisService } from '../../../../shared/infrastructure';
import type { Movie } from '../../domain/entities';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { GetMovieByIdQuery } from '../queries';

const CACHE_TTL_MS = 30000; // 30 seconds

@QueryHandler(GetMovieByIdQuery)
export class GetMovieByIdHandler implements IQueryHandler<GetMovieByIdQuery> {
  private readonly logger = new Logger(GetMovieByIdHandler.name);

  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
    private readonly redis: RedisService,
  ) {}

  async execute(query: GetMovieByIdQuery): Promise<Movie> {
    const cacheKey = `movies:detail:${query.id}`;

    return this.redis.getOrSetWithLock(
      cacheKey,
      async () => {
        const start = Date.now();

        const movie = await this.movieRepository.findById(query.id);

        if (!movie) {
          throw new ApplicationException(
            ApplicationErrorCode.MOVIE_NOT_FOUND,
            `Movie with ID ${query.id} not found`,
            { movieId: query.id },
          );
        }

        this.logger.warn(
          `Cache miss - movie ${query.id} fetched from database in ${Date.now() - start}ms`,
        );

        return movie;
      },
      CACHE_TTL_MS,
      {
        lockTtlMs: 5000,
        jitterMs: 50,
        maxWaitMs: 1000,
        retryIntervalMs: 50,
      },
    );
  }
}
