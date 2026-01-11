import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth';
import { MoviesModule } from './modules/movies';
import { SessionsModule } from './modules/sessions';
import { TicketsModule } from './modules/tickets';
import { WatchModule } from './modules/watch';
import { PrismaModule } from './shared/infrastructure/prisma';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MoviesModule,
    SessionsModule,
    TicketsModule,
    WatchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
