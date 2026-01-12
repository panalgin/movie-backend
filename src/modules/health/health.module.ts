import { Module } from '@nestjs/common';
import { PrismaModule, RedisModule } from '../../shared/infrastructure';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
