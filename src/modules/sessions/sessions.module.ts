import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MOVIE_REPOSITORY } from '../movies/domain/repositories';
import { PrismaMovieRepository } from '../movies/infrastructure/persistence';
import { CommandHandlers, QueryHandlers } from './application/handlers';
import { SESSION_REPOSITORY } from './domain/repositories';
import { PrismaSessionRepository } from './infrastructure/persistence';
import { SessionsController } from './presentation';

@Module({
  imports: [CqrsModule],
  controllers: [SessionsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: SESSION_REPOSITORY,
      useClass: PrismaSessionRepository,
    },
    {
      provide: MOVIE_REPOSITORY,
      useClass: PrismaMovieRepository,
    },
  ],
  exports: [SESSION_REPOSITORY],
})
export class SessionsModule {}
