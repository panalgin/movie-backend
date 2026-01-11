import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SESSION_REPOSITORY } from '../sessions/domain/repositories';
import { PrismaSessionRepository } from '../sessions/infrastructure/persistence';
import { TICKET_REPOSITORY } from '../tickets/domain/repositories';
import { PrismaTicketRepository } from '../tickets/infrastructure/persistence';
import { CommandHandlers, QueryHandlers } from './application/handlers';
import { WATCH_HISTORY_REPOSITORY } from './domain/repositories';
import { PrismaWatchHistoryRepository } from './infrastructure/persistence';
import { WatchController } from './presentation';

@Module({
  imports: [CqrsModule],
  controllers: [WatchController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: WATCH_HISTORY_REPOSITORY,
      useClass: PrismaWatchHistoryRepository,
    },
    {
      provide: TICKET_REPOSITORY,
      useClass: PrismaTicketRepository,
    },
    {
      provide: SESSION_REPOSITORY,
      useClass: PrismaSessionRepository,
    },
  ],
  exports: [WATCH_HISTORY_REPOSITORY],
})
export class WatchModule {}
