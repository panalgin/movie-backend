import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Movie } from '../../domain/entities';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { BulkCreateMoviesCommand } from '../commands';

@CommandHandler(BulkCreateMoviesCommand)
export class BulkCreateMoviesHandler
  implements ICommandHandler<BulkCreateMoviesCommand>
{
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
  ) {}

  async execute(command: BulkCreateMoviesCommand): Promise<Movie[]> {
    const movies = command.movies.map((dto) =>
      Movie.create({
        title: dto.title,
        description: dto.description,
        ageRestriction: dto.ageRestriction,
      }),
    );

    return this.movieRepository.saveMany(movies);
  }
}
