import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { Movie } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { GetMoviesQuery } from '../queries';

@QueryHandler(GetMoviesQuery)
export class GetMoviesHandler implements IQueryHandler<GetMoviesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMoviesQuery): Promise<Movie[]> {
    return this.prisma.movie.findMany({
      skip: query.skip,
      take: query.take,
      orderBy: { createdAt: 'desc' },
    });
  }
}
