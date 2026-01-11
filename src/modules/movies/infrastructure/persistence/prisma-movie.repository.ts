import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma';
import { Movie } from '../../domain/entities';
import type {
  FindMoviesOptions,
  IMovieRepository,
} from '../../domain/repositories';

@Injectable()
export class PrismaMovieRepository implements IMovieRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Movie | null> {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      return null;
    }

    return Movie.reconstitute(movie.id, {
      title: movie.title,
      description: movie.description,
      ageRestriction: movie.ageRestriction,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
    });
  }

  async findAll(options?: FindMoviesOptions): Promise<Movie[]> {
    const where: Prisma.MovieWhereInput = {};

    if (options?.filterByAgeRestriction !== undefined) {
      where.ageRestriction = { lte: options.filterByAgeRestriction };
    }

    const orderBy: Prisma.MovieOrderByWithRelationInput = {};
    if (options?.sortBy) {
      orderBy[options.sortBy] = options.sortOrder ?? 'asc';
    }

    const movies = await this.prisma.movie.findMany({
      where,
      orderBy: options?.sortBy ? orderBy : { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    });

    return movies.map((movie) =>
      Movie.reconstitute(movie.id, {
        title: movie.title,
        description: movie.description,
        ageRestriction: movie.ageRestriction,
        createdAt: movie.createdAt,
        updatedAt: movie.updatedAt,
      }),
    );
  }

  async save(movie: Movie): Promise<Movie> {
    const saved = await this.prisma.movie.create({
      data: {
        id: movie.id,
        title: movie.title,
        description: movie.description,
        ageRestriction: movie.ageRestriction,
      },
    });

    return Movie.reconstitute(saved.id, {
      title: saved.title,
      description: saved.description,
      ageRestriction: saved.ageRestriction,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    });
  }

  async update(movie: Movie): Promise<Movie> {
    const updated = await this.prisma.movie.update({
      where: { id: movie.id },
      data: {
        title: movie.title,
        description: movie.description,
        ageRestriction: movie.ageRestriction,
      },
    });

    return Movie.reconstitute(updated.id, {
      title: updated.title,
      description: updated.description,
      ageRestriction: updated.ageRestriction,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.movie.delete({
      where: { id },
    });
  }

  async count(options?: FindMoviesOptions): Promise<number> {
    const where: Prisma.MovieWhereInput = {};

    if (options?.filterByAgeRestriction !== undefined) {
      where.ageRestriction = { lte: options.filterByAgeRestriction };
    }

    return this.prisma.movie.count({ where });
  }

  async saveMany(movies: Movie[]): Promise<Movie[]> {
    const data = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      description: movie.description,
      ageRestriction: movie.ageRestriction,
    }));

    await this.prisma.movie.createMany({ data });

    return this.prisma.movie
      .findMany({
        where: { id: { in: movies.map((m) => m.id) } },
      })
      .then((saved) =>
        saved.map((movie) =>
          Movie.reconstitute(movie.id, {
            title: movie.title,
            description: movie.description,
            ageRestriction: movie.ageRestriction,
            createdAt: movie.createdAt,
            updatedAt: movie.updatedAt,
          }),
        ),
      );
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.prisma.movie.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
