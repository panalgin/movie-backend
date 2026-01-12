import { Test, type TestingModule } from '@nestjs/testing';
import { AuditService } from '../../../audit/application';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { CreateMovieCommand } from '../commands';
import { CreateMovieHandler } from './create-movie.handler';

describe('CreateMovieHandler', () => {
  let handler: CreateMovieHandler;
  let movieRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    movieRepository = {
      save: jest.fn().mockImplementation((movie) => Promise.resolve(movie)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMovieHandler,
        { provide: MOVIE_REPOSITORY, useValue: movieRepository },
        {
          provide: AuditService,
          useValue: {
            logSuccess: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    handler = module.get<CreateMovieHandler>(CreateMovieHandler);
  });

  it('should create movie successfully', async () => {
    const command = new CreateMovieCommand(
      'Test Movie',
      'A test movie description',
      13,
      'actor-id',
      'MANAGER',
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.title).toBe('Test Movie');
    expect(result.description).toBe('A test movie description');
    expect(result.ageRestriction).toBe(13);
    expect(movieRepository.save).toHaveBeenCalled();
  });

  it('should create movie with default age restriction', async () => {
    const command = new CreateMovieCommand(
      'Family Movie',
      undefined,
      0,
      'actor-id',
      'MANAGER',
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.title).toBe('Family Movie');
    expect(result.ageRestriction).toBe(0);
  });
});
