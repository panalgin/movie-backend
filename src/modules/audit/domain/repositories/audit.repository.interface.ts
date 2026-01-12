import type { AuditLog } from '../entities';

export const AUDIT_REPOSITORY = Symbol('AUDIT_REPOSITORY');

export interface IAuditRepository {
  create(auditLog: AuditLog): Promise<AuditLog>;
  findByActorId(actorId: string, limit?: number): Promise<AuditLog[]>;
  findByEntityId(
    entityType: string,
    entityId: string,
    limit?: number,
  ): Promise<AuditLog[]>;
  findByAction(action: string, limit?: number): Promise<AuditLog[]>;
  findRecent(limit?: number): Promise<AuditLog[]>;
}
