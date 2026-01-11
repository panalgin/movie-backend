import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { Movie } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { CreateMovieCommand } from '../commands';

@CommandHandler(CreateMovieCommand)
export class CreateMovieHandler implements ICommandHandler<CreateMovieCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateMovieCommand): Promise<Movie> {
    return this.prisma.movie.create({
      data: {
        title: command.title,
        description: command.description,
        releaseYear: command.releaseYear,
        rating: command.rating,
      },
    });
  }
}
