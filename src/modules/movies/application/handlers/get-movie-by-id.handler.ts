import { Inject, NotFoundException } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Movie } from '../../domain/entities';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { GetMovieByIdQuery } from '../queries';

@QueryHandler(GetMovieByIdQuery)
export class GetMovieByIdHandler implements IQueryHandler<GetMovieByIdQuery> {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
  ) {}

  async execute(query: GetMovieByIdQuery): Promise<Movie> {
    const movie = await this.movieRepository.findById(query.id);

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${query.id} not found`);
    }

    return movie;
  }
}
