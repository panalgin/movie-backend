import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { AuditLog } from '../domain/entities';
import { AuditAction, AuditEntityType, AuditStatus } from '../domain/enums';
import { AUDIT_REPOSITORY } from '../domain/repositories';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;
  let auditRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    auditRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      findByActorId: jest.fn().mockResolvedValue([]),
      findByEntityId: jest.fn().mockResolvedValue([]),
      findByAction: jest.fn().mockResolvedValue([]),
      findRecent: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: AUDIT_REPOSITORY, useValue: auditRepository },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log', () => {
    it('should create audit log with all params', async () => {
      await service.log(
        {
          action: AuditAction.MOVIE_CREATE,
          entityType: AuditEntityType.MOVIE,
          entityId: 'movie-id',
          status: AuditStatus.SUCCESS,
          changes: { after: { title: 'Test' } },
          metadata: { extra: 'data' },
        },
        {
          actorId: 'user-id',
          actorRole: 'MANAGER',
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
        },
      );

      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.MOVIE_CREATE,
          entityType: AuditEntityType.MOVIE,
          entityId: 'movie-id',
          status: AuditStatus.SUCCESS,
          actorId: 'user-id',
          actorRole: 'MANAGER',
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent',
        }),
      );
    });

    it('should default status to SUCCESS', async () => {
      await service.log({
        action: AuditAction.USER_LOGIN,
      });

      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AuditStatus.SUCCESS,
        }),
      );
    });

    it('should not throw on repository error', async () => {
      auditRepository.create.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.log({ action: AuditAction.USER_LOGIN }),
      ).resolves.not.toThrow();
    });
  });

  describe('logSuccess', () => {
    it('should log with SUCCESS status', async () => {
      await service.logSuccess({
        action: AuditAction.TICKET_PURCHASE,
        entityType: AuditEntityType.TICKET,
        entityId: 'ticket-id',
      });

      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AuditStatus.SUCCESS,
        }),
      );
    });
  });

  describe('logFailure', () => {
    it('should log with FAILURE status', async () => {
      await service.logFailure({
        action: AuditAction.USER_LOGIN_FAILED,
        metadata: { email: 'test@test.com' },
      });

      expect(auditRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: AuditStatus.FAILURE,
        }),
      );
    });
  });

  describe('query methods', () => {
    const mockLogs = [
      new AuditLog({
        action: AuditAction.MOVIE_CREATE,
        status: AuditStatus.SUCCESS,
      }),
    ];

    beforeEach(() => {
      auditRepository.findByActorId.mockResolvedValue(mockLogs);
      auditRepository.findByEntityId.mockResolvedValue(mockLogs);
      auditRepository.findByAction.mockResolvedValue(mockLogs);
      auditRepository.findRecent.mockResolvedValue(mockLogs);
    });

    it('should get logs by actor', async () => {
      const result = await service.getByActor('user-id', 10);

      expect(result).toEqual(mockLogs);
      expect(auditRepository.findByActorId).toHaveBeenCalledWith('user-id', 10);
    });

    it('should get logs by entity', async () => {
      const result = await service.getByEntity(
        AuditEntityType.MOVIE,
        'movie-id',
        10,
      );

      expect(result).toEqual(mockLogs);
      expect(auditRepository.findByEntityId).toHaveBeenCalledWith(
        AuditEntityType.MOVIE,
        'movie-id',
        10,
      );
    });

    it('should get logs by action', async () => {
      const result = await service.getByAction(AuditAction.MOVIE_CREATE, 10);

      expect(result).toEqual(mockLogs);
      expect(auditRepository.findByAction).toHaveBeenCalledWith(
        AuditAction.MOVIE_CREATE,
        10,
      );
    });

    it('should get recent logs', async () => {
      const result = await service.getRecent(10);

      expect(result).toEqual(mockLogs);
      expect(auditRepository.findRecent).toHaveBeenCalledWith(10);
    });
  });
});
