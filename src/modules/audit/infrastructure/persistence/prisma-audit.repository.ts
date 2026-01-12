import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { AuditLog } from '../../domain/entities';
import type { IAuditRepository } from '../../domain/repositories';

@Injectable()
export class PrismaAuditRepository implements IAuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(auditLog: AuditLog): Promise<AuditLog> {
    const created = await this.prisma.auditLog.create({
      data: {
        actorId: auditLog.actorId,
        actorRole: auditLog.actorRole,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        status: auditLog.status,
        ipAddress: auditLog.ipAddress,
        userAgent: auditLog.userAgent,
        changes: auditLog.changes as object | undefined,
        metadata: auditLog.metadata as object | undefined,
      },
    });

    return this.mapToDomain(created);
  }

  async findByActorId(actorId: string, limit = 100): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map(this.mapToDomain);
  }

  async findByEntityId(
    entityType: string,
    entityId: string,
    limit = 100,
  ): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map(this.mapToDomain);
  }

  async findByAction(action: string, limit = 100): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map(this.mapToDomain);
  }

  async findRecent(limit = 100): Promise<AuditLog[]> {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map(this.mapToDomain);
  }

  private mapToDomain(record: {
    id: string;
    actorId: string | null;
    actorRole: string | null;
    action: string;
    entityType: string | null;
    entityId: string | null;
    status: string;
    ipAddress: string | null;
    userAgent: string | null;
    changes: unknown;
    metadata: unknown;
    createdAt: Date;
  }): AuditLog {
    return new AuditLog({
      id: record.id,
      actorId: record.actorId ?? undefined,
      actorRole: record.actorRole ?? undefined,
      action: record.action as AuditLog['action'],
      entityType: record.entityType as AuditLog['entityType'],
      entityId: record.entityId ?? undefined,
      status: record.status as AuditLog['status'],
      ipAddress: record.ipAddress ?? undefined,
      userAgent: record.userAgent ?? undefined,
      changes: record.changes as Record<string, unknown> | undefined,
      metadata: record.metadata as Record<string, unknown> | undefined,
      createdAt: record.createdAt,
    });
  }
}
