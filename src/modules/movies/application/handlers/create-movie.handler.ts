import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import { Movie } from '../../domain/entities';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { CreateMovieCommand } from '../commands';

@CommandHandler(CreateMovieCommand)
export class CreateMovieHandler implements ICommandHandler<CreateMovieCommand> {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
  ) {}

  async execute(command: CreateMovieCommand): Promise<Movie> {
    const movie = Movie.create({
      title: command.title,
      description: command.description,
      ageRestriction: command.ageRestriction,
    });

    return this.movieRepository.save(movie);
  }
}
