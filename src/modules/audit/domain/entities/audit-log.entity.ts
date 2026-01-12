import type { AuditAction, AuditEntityType, AuditStatus } from '../enums';

export interface AuditLogProps {
  id?: string;
  actorId?: string;
  actorRole?: string;
  action: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  status: AuditStatus;
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export class AuditLog {
  readonly id?: string;
  readonly actorId?: string;
  readonly actorRole?: string;
  readonly action: AuditAction;
  readonly entityType?: AuditEntityType;
  readonly entityId?: string;
  readonly status: AuditStatus;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly changes?: Record<string, unknown>;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt?: Date;

  constructor(props: AuditLogProps) {
    this.id = props.id;
    this.actorId = props.actorId;
    this.actorRole = props.actorRole;
    this.action = props.action;
    this.entityType = props.entityType;
    this.entityId = props.entityId;
    this.status = props.status;
    this.ipAddress = props.ipAddress;
    this.userAgent = props.userAgent;
    this.changes = props.changes;
    this.metadata = props.metadata;
    this.createdAt = props.createdAt;
  }
}
