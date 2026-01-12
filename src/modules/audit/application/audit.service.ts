import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuditLog } from '../domain/entities';
import { AuditAction, AuditEntityType, AuditStatus } from '../domain/enums';
import {
  AUDIT_REPOSITORY,
  type IAuditRepository,
} from '../domain/repositories';

export interface AuditContext {
  actorId?: string;
  actorRole?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogParams {
  action: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  status?: AuditStatus;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepository: IAuditRepository,
  ) {}

  async log(params: AuditLogParams, context: AuditContext = {}): Promise<void> {
    try {
      const auditLog = new AuditLog({
        actorId: context.actorId,
        actorRole: context.actorRole,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        status: params.status ?? AuditStatus.SUCCESS,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        changes: params.changes,
        metadata: params.metadata,
      });

      await this.auditRepository.create(auditLog);

      this.logger.debug(
        `Audit: ${params.action} by ${context.actorId ?? 'system'} on ${params.entityType ?? 'N/A'}:${params.entityId ?? 'N/A'}`,
      );
    } catch (error) {
      // Audit failures should not break the main flow
      this.logger.error('Failed to create audit log', error);
    }
  }

  async logSuccess(
    params: Omit<AuditLogParams, 'status'>,
    context: AuditContext = {},
  ): Promise<void> {
    return this.log({ ...params, status: AuditStatus.SUCCESS }, context);
  }

  async logFailure(
    params: Omit<AuditLogParams, 'status'>,
    context: AuditContext = {},
  ): Promise<void> {
    return this.log({ ...params, status: AuditStatus.FAILURE }, context);
  }

  async getByActor(actorId: string, limit?: number): Promise<AuditLog[]> {
    return this.auditRepository.findByActorId(actorId, limit);
  }

  async getByEntity(
    entityType: AuditEntityType,
    entityId: string,
    limit?: number,
  ): Promise<AuditLog[]> {
    return this.auditRepository.findByEntityId(entityType, entityId, limit);
  }

  async getByAction(action: AuditAction, limit?: number): Promise<AuditLog[]> {
    return this.auditRepository.findByAction(action, limit);
  }

  async getRecent(limit?: number): Promise<AuditLog[]> {
    return this.auditRepository.findRecent(limit);
  }
}
