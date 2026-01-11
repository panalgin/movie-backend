import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { Movie } from '../../domain/entities';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { UpdateMovieCommand } from '../commands';

@CommandHandler(UpdateMovieCommand)
export class UpdateMovieHandler implements ICommandHandler<UpdateMovieCommand> {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
  ) {}

  async execute(command: UpdateMovieCommand): Promise<Movie> {
    const movie = await this.movieRepository.findById(command.id);

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${command.id} not found`);
    }

    const updatedMovie = movie.update({
      title: command.title,
      description: command.description,
      ageRestriction: command.ageRestriction,
    });

    return this.movieRepository.update(updatedMovie);
  }
}
