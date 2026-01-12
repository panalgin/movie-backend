import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationErrorCode } from '../../../../shared/application';
import { AuditService } from '../../../audit/application';
import { Movie } from '../../domain/entities';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { UpdateMovieCommand } from '../commands';
import { UpdateMovieHandler } from './update-movie.handler';

describe('UpdateMovieHandler', () => {
  let handler: UpdateMovieHandler;
  let movieRepository: Record<string, jest.Mock>;
  let mockMovie: Movie;

  beforeEach(async () => {
    mockMovie = Movie.reconstitute('movie-id', {
      title: 'Original Title',
      description: 'Original description',
      ageRestriction: 13,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    movieRepository = {
      findById: jest.fn().mockResolvedValue(mockMovie),
      update: jest.fn().mockImplementation((movie) => Promise.resolve(movie)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMovieHandler,
        { provide: MOVIE_REPOSITORY, useValue: movieRepository },
        {
          provide: AuditService,
          useValue: {
            logSuccess: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    handler = module.get<UpdateMovieHandler>(UpdateMovieHandler);
  });

  it('should update movie successfully', async () => {
    const command = new UpdateMovieCommand(
      'movie-id',
      'Updated Title',
      'Updated description',
      18,
      'actor-id',
      'MANAGER',
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.title).toBe('Updated Title');
    expect(result.description).toBe('Updated description');
    expect(result.ageRestriction).toBe(18);
    expect(movieRepository.update).toHaveBeenCalled();
  });

  it('should update movie with partial data', async () => {
    const command = new UpdateMovieCommand(
      'movie-id',
      'New Title Only',
      undefined,
      undefined,
      'actor-id',
      'MANAGER',
    );

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.title).toBe('New Title Only');
  });

  it('should throw ApplicationException if movie not found', async () => {
    movieRepository.findById.mockResolvedValue(null);

    const command = new UpdateMovieCommand(
      'non-existent-id',
      'Title',
      undefined,
      undefined,
      'actor-id',
      'MANAGER',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.MOVIE_NOT_FOUND,
      }),
    );
  });
});
