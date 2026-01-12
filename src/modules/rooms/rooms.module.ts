import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers, QueryHandlers } from './application/handlers';
import { ROOM_REPOSITORY } from './domain/repositories';
import { PrismaRoomRepository } from './infrastructure/persistence';
import { RoomsController } from './presentation';

@Module({
  imports: [CqrsModule],
  controllers: [RoomsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: ROOM_REPOSITORY,
      useClass: PrismaRoomRepository,
    },
  ],
  exports: [ROOM_REPOSITORY],
})
export class RoomsModule {}
