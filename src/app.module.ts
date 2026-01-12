import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './modules/audit';
import { AuthModule } from './modules/auth';
import { HealthModule } from './modules/health';
import { MoviesModule } from './modules/movies';
import { NotificationsModule } from './modules/notifications';
import { SessionsModule } from './modules/sessions';
import { TicketsModule } from './modules/tickets';
import { WatchModule } from './modules/watch';
import {
  CorrelationIdMiddleware,
  GlobalExceptionFilter,
  PerformanceInterceptor,
  PrismaModule,
  RedisModule,
} from './shared/infrastructure';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuditModule,
    NotificationsModule,
    HealthModule,
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
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
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
