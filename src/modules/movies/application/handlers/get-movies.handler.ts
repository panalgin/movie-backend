import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Movie } from '../../domain/entities';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { GetMoviesQuery } from '../queries';

@QueryHandler(GetMoviesQuery)
export class GetMoviesHandler implements IQueryHandler<GetMoviesQuery> {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
  ) {}

  async execute(query: GetMoviesQuery): Promise<Movie[]> {
    return this.movieRepository.findAll({
      skip: query.skip,
      take: query.take,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      filterByAgeRestriction: query.filterByAgeRestriction,
    });
  }
}
