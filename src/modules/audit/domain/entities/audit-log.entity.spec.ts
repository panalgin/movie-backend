import { AuditAction, AuditEntityType, AuditStatus } from '../enums';
import { AuditLog } from './audit-log.entity';

describe('AuditLog', () => {
  describe('constructor', () => {
    it('should create audit log with required fields', () => {
      const log = new AuditLog({
        action: AuditAction.USER_LOGIN,
        status: AuditStatus.SUCCESS,
      });

      expect(log.action).toBe(AuditAction.USER_LOGIN);
      expect(log.status).toBe(AuditStatus.SUCCESS);
    });

    it('should create audit log with all fields', () => {
      const createdAt = new Date();
      const log = new AuditLog({
        id: 'log-id',
        actorId: 'user-id',
        actorRole: 'MANAGER',
        action: AuditAction.MOVIE_CREATE,
        entityType: AuditEntityType.MOVIE,
        entityId: 'movie-id',
        status: AuditStatus.SUCCESS,
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        changes: {
          before: {},
          after: { title: 'New Movie' },
        },
        metadata: { extra: 'info' },
        createdAt,
      });

      expect(log.id).toBe('log-id');
      expect(log.actorId).toBe('user-id');
      expect(log.actorRole).toBe('MANAGER');
      expect(log.action).toBe(AuditAction.MOVIE_CREATE);
      expect(log.entityType).toBe(AuditEntityType.MOVIE);
      expect(log.entityId).toBe('movie-id');
      expect(log.status).toBe(AuditStatus.SUCCESS);
      expect(log.ipAddress).toBe('192.168.1.1');
      expect(log.userAgent).toBe('Mozilla/5.0');
      expect(log.changes).toEqual({
        before: {},
        after: { title: 'New Movie' },
      });
      expect(log.metadata).toEqual({ extra: 'info' });
      expect(log.createdAt).toBe(createdAt);
    });

    it('should allow optional fields to be undefined', () => {
      const log = new AuditLog({
        action: AuditAction.USER_LOGOUT,
        status: AuditStatus.SUCCESS,
      });

      expect(log.id).toBeUndefined();
      expect(log.actorId).toBeUndefined();
      expect(log.entityType).toBeUndefined();
      expect(log.entityId).toBeUndefined();
      expect(log.ipAddress).toBeUndefined();
      expect(log.changes).toBeUndefined();
      expect(log.metadata).toBeUndefined();
    });

    it('should handle failure status', () => {
      const log = new AuditLog({
        action: AuditAction.USER_LOGIN_FAILED,
        status: AuditStatus.FAILURE,
        metadata: { reason: 'Invalid credentials' },
      });

      expect(log.status).toBe(AuditStatus.FAILURE);
      expect(log.metadata).toEqual({ reason: 'Invalid credentials' });
    });
  });
});
