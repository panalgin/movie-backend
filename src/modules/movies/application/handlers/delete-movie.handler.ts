import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { Movie } from '../../domain/entities';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { DeleteMovieCommand } from '../commands';

@CommandHandler(DeleteMovieCommand)
export class DeleteMovieHandler implements ICommandHandler<DeleteMovieCommand> {
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
  ) {}

  async execute(command: DeleteMovieCommand): Promise<Movie> {
    const movie = await this.movieRepository.findById(command.id);

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${command.id} not found`);
    }

    await this.movieRepository.delete(command.id);
    return movie;
  }
}
