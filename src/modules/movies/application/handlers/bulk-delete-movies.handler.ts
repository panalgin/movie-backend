import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { IMovieRepository } from '../../domain/repositories';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { BulkDeleteMoviesCommand } from '../commands';

@CommandHandler(BulkDeleteMoviesCommand)
export class BulkDeleteMoviesHandler
  implements ICommandHandler<BulkDeleteMoviesCommand>
{
  constructor(
    @Inject(MOVIE_REPOSITORY)
    private readonly movieRepository: IMovieRepository,
  ) {}

  async execute(
    command: BulkDeleteMoviesCommand,
  ): Promise<{ deleted: number }> {
    await this.movieRepository.deleteMany(command.ids);
    return { deleted: command.ids.length };
  }
}
