import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers, QueryHandlers } from './handlers';
import { MoviesController } from './movies.controller';

@Module({
  imports: [CqrsModule],
  controllers: [MoviesController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class MoviesModule {}
