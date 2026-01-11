import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers, QueryHandlers } from './application/handlers';
import { MOVIE_REPOSITORY } from './domain/repositories';
import { PrismaMovieRepository } from './infrastructure/persistence';
import { MoviesController } from './presentation';

@Module({
  imports: [CqrsModule],
  controllers: [MoviesController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: MOVIE_REPOSITORY,
      useClass: PrismaMovieRepository,
    },
  ],
  exports: [MOVIE_REPOSITORY],
})
export class MoviesModule {}
