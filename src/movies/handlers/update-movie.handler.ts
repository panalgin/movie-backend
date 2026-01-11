import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { Movie } from '../../../generated/prisma';
import type { PrismaService } from '../../prisma';
import { UpdateMovieCommand } from '../commands';

@CommandHandler(UpdateMovieCommand)
export class UpdateMovieHandler implements ICommandHandler<UpdateMovieCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateMovieCommand): Promise<Movie> {
    return this.prisma.movie.update({
      where: { id: command.id },
      data: {
        title: command.title,
        description: command.description,
        releaseYear: command.releaseYear,
        rating: command.rating,
      },
    });
  }
}
