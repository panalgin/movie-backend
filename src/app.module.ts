import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth';
import { MoviesModule } from './modules/movies';
import { SessionsModule } from './modules/sessions';
import { TicketsModule } from './modules/tickets';
import { WatchModule } from './modules/watch';
import {
  CorrelationIdMiddleware,
  PerformanceInterceptor,
  PrismaModule,
} from './shared/infrastructure';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute (general)
      },
    ]),
    PrismaModule,
    AuthModule,
    MoviesModule,
    SessionsModule,
    TicketsModule,
    WatchModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
