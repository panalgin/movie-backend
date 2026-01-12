import { Test, type TestingModule } from '@nestjs/testing';
import { AuditService } from '../../../audit/application';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { BulkDeleteMoviesCommand } from '../commands';
import { BulkDeleteMoviesHandler } from './bulk-delete-movies.handler';

describe('BulkDeleteMoviesHandler', () => {
  let handler: BulkDeleteMoviesHandler;
  let movieRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    movieRepository = {
      deleteMany: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkDeleteMoviesHandler,
        { provide: MOVIE_REPOSITORY, useValue: movieRepository },
        {
          provide: AuditService,
          useValue: {
            logSuccess: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    handler = module.get<BulkDeleteMoviesHandler>(BulkDeleteMoviesHandler);
  });

  it('should bulk delete movies successfully', async () => {
    const command = new BulkDeleteMoviesCommand(
      ['id-1', 'id-2', 'id-3'],
      'actor-id',
      'MANAGER',
    );

    const result = await handler.execute(command);

    expect(result).toEqual({ deleted: 3 });
    expect(movieRepository.deleteMany).toHaveBeenCalledWith([
      'id-1',
      'id-2',
      'id-3',
    ]);
  });

  it('should handle empty array', async () => {
    const command = new BulkDeleteMoviesCommand([], 'actor-id', 'MANAGER');

    const result = await handler.execute(command);

    expect(result).toEqual({ deleted: 0 });
    expect(movieRepository.deleteMany).toHaveBeenCalledWith([]);
  });
});
