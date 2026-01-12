import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationErrorCode } from '../../../../shared/application';
import { AuditService } from '../../../audit/application';
import { Movie } from '../../domain/entities';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { DeleteMovieCommand } from '../commands';
import { DeleteMovieHandler } from './delete-movie.handler';

describe('DeleteMovieHandler', () => {
  let handler: DeleteMovieHandler;
  let movieRepository: Record<string, jest.Mock>;

  const mockMovie = Movie.reconstitute('movie-id', {
    title: 'Test Movie',
    description: 'Test description',
    ageRestriction: 13,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(async () => {
    movieRepository = {
      findById: jest.fn().mockResolvedValue(mockMovie),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteMovieHandler,
        { provide: MOVIE_REPOSITORY, useValue: movieRepository },
        {
          provide: AuditService,
          useValue: {
            logSuccess: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    handler = module.get<DeleteMovieHandler>(DeleteMovieHandler);
  });

  it('should delete movie successfully', async () => {
    const command = new DeleteMovieCommand('movie-id', 'actor-id', 'MANAGER');

    const result = await handler.execute(command);

    expect(result).toBeDefined();
    expect(result.id).toBe('movie-id');
    expect(movieRepository.findById).toHaveBeenCalledWith('movie-id');
    expect(movieRepository.delete).toHaveBeenCalledWith('movie-id');
  });

  it('should throw ApplicationException if movie not found', async () => {
    movieRepository.findById.mockResolvedValue(null);

    const command = new DeleteMovieCommand(
      'non-existent-id',
      'actor-id',
      'MANAGER',
    );

    await expect(handler.execute(command)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.MOVIE_NOT_FOUND,
      }),
    );
    expect(movieRepository.delete).not.toHaveBeenCalled();
  });
});
