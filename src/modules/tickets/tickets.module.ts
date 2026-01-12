import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { USER_REPOSITORY } from '../auth/domain/repositories';
import { PrismaUserRepository } from '../auth/infrastructure/persistence';
import { MOVIE_REPOSITORY } from '../movies/domain/repositories';
import { PrismaMovieRepository } from '../movies/infrastructure/persistence';
import { ROOM_REPOSITORY } from '../rooms/domain/repositories';
import { PrismaRoomRepository } from '../rooms/infrastructure/persistence';
import { SESSION_REPOSITORY } from '../sessions/domain/repositories';
import { PrismaSessionRepository } from '../sessions/infrastructure/persistence';
import { CommandHandlers, QueryHandlers } from './application/handlers';
import { TICKET_REPOSITORY } from './domain/repositories';
import { PrismaTicketRepository } from './infrastructure/persistence';
import { TicketsController } from './presentation';

@Module({
  imports: [CqrsModule],
  controllers: [TicketsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: TICKET_REPOSITORY,
      useClass: PrismaTicketRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: PrismaSessionRepository,
    },
    {
      provide: ROOM_REPOSITORY,
      useClass: PrismaRoomRepository,
    },
    {
      provide: MOVIE_REPOSITORY,
      useClass: PrismaMovieRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [TICKET_REPOSITORY],
})
export class TicketsModule {}
