import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { Movie } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma';
import { DeleteMovieCommand } from '../commands';

@CommandHandler(DeleteMovieCommand)
export class DeleteMovieHandler implements ICommandHandler<DeleteMovieCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeleteMovieCommand): Promise<Movie> {
    return this.prisma.movie.delete({
      where: { id: command.id },
    });
  }
}
