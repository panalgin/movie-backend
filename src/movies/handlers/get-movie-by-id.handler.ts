import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Movie } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { GetMovieByIdQuery } from '../queries';

@QueryHandler(GetMovieByIdQuery)
export class GetMovieByIdHandler implements IQueryHandler<GetMovieByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMovieByIdQuery): Promise<Movie | null> {
    return this.prisma.movie.findUnique({
      where: { id: query.id },
    });
  }
}
