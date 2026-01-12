import { Test, type TestingModule } from '@nestjs/testing';
import { AuditService } from '../../../audit/application';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { BulkCreateMoviesCommand } from '../commands';
import { BulkCreateMoviesHandler } from './bulk-create-movies.handler';

describe('BulkCreateMoviesHandler', () => {
  let handler: BulkCreateMoviesHandler;
  let movieRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    movieRepository = {
      saveMany: jest
        .fn()
        .mockImplementation((movies) => Promise.resolve(movies)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkCreateMoviesHandler,
        { provide: MOVIE_REPOSITORY, useValue: movieRepository },
        {
          provide: AuditService,
          useValue: {
            logSuccess: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    handler = module.get<BulkCreateMoviesHandler>(BulkCreateMoviesHandler);
  });

  it('should bulk create movies successfully', async () => {
    const command = new BulkCreateMoviesCommand(
      [
        { title: 'Movie 1', ageRestriction: 0 },
        { title: 'Movie 2', description: 'Description', ageRestriction: 13 },
        { title: 'Movie 3', ageRestriction: 18 },
      ],
      'actor-id',
      'MANAGER',
    );

    const result = await handler.execute(command);

    expect(result).toHaveLength(3);
    expect(result[0].title).toBe('Movie 1');
    expect(result[1].title).toBe('Movie 2');
    expect(result[2].title).toBe('Movie 3');
    expect(movieRepository.saveMany).toHaveBeenCalled();
  });

  it('should handle empty array', async () => {
    const command = new BulkCreateMoviesCommand([], 'actor-id', 'MANAGER');

    const result = await handler.execute(command);

    expect(result).toHaveLength(0);
    expect(movieRepository.saveMany).toHaveBeenCalledWith([]);
  });
});
