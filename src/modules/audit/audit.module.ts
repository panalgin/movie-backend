import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure';
import { AuditService } from './application';
import { AUDIT_REPOSITORY } from './domain/repositories';
import { PrismaAuditRepository } from './infrastructure/persistence';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    AuditService,
    {
      provide: AUDIT_REPOSITORY,
      useClass: PrismaAuditRepository,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
