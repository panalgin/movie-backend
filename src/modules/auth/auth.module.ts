import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './application';
import { USER_REPOSITORY } from './domain/repositories';
import { PrismaUserRepository } from './infrastructure/persistence';
import {
  AuthController,
  JwtAuthGuard,
  JwtStrategy,
  LocalStrategy,
  RolesGuard,
} from './presentation';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'super-secret-key',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
