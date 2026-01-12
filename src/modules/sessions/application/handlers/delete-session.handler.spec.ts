import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationErrorCode } from '../../../../shared/application';
import { AuditService } from '../../../audit/application';
import { TimeSlotEnum } from '../../../movies/domain/value-objects';
import { Session } from '../../domain/entities';
import { SESSION_REPOSITORY } from '../../domain/repositories';
import { DeleteSessionCommand } from '../commands';
import { DeleteSessionHandler } from './delete-session.handler';

describe('DeleteSessionHandler', () => {
  let handler: DeleteSessionHandler;
  let sessionRepository: Record<string, jest.Mock>;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  const mockSession = Session.reconstitute('session-id', {
    movieId: 'movie-id',
    roomId: 'room-id',
    date: futureDate,
    timeSlot: TimeSlotEnum.SLOT_14_16,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    sessionRepository = {
      findById: jest.fn().mockResolvedValue(mockSession),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSessionHandler,
        { provide: SESSION_REPOSITORY, useValue: sessionRepository },
        {
          provide: AuditService,
          useValue: {
            logSuccess: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    handler = module.get<DeleteSessionHandler>(DeleteSessionHandler);
  });

  it('should delete session successfully', async () => {
    const command = new DeleteSessionCommand(
      'session-id',
      'actor-id',
      'MANAGER',
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.id).toBe('session-id');
    expect(sessionRepository.findById).toHaveBeenCalledWith('session-id');
    expect(sessionRepository.delete).toHaveBeenCalledWith('session-id');
  });

  it('should throw ApplicationException if session not found', async () => {
    sessionRepository.findById.mockResolvedValue(null);

    const command = new DeleteSessionCommand(
      'non-existent-id',
      'actor-id',
      'MANAGER',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.SESSION_NOT_FOUND,
      }),
    );
    expect(sessionRepository.delete).not.toHaveBeenCalled();
  });
});
