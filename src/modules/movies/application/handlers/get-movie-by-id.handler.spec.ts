import { Test, type TestingModule } from '@nestjs/testing';
import { ApplicationErrorCode } from '../../../../shared/application';
import { RedisService } from '../../../../shared/infrastructure';
import { Movie } from '../../domain/entities';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { GetMovieByIdQuery } from '../queries';
import { GetMovieByIdHandler } from './get-movie-by-id.handler';

describe('GetMovieByIdHandler', () => {
  let handler: GetMovieByIdHandler;
  let movieRepository: Record<string, jest.Mock>;
  let redisService: Record<string, jest.Mock>;

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
    };

    redisService = {
      getOrSetWithLock: jest
        .fn()
        .mockImplementation((_key, fetcher) => fetcher()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMovieByIdHandler,
        { provide: MOVIE_REPOSITORY, useValue: movieRepository },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    handler = module.get<GetMovieByIdHandler>(GetMovieByIdHandler);
  });

  it('should return movie by id', async () => {
    const query = new GetMovieByIdQuery('movie-id');

    const result = await handler.execute(query);

    expect(result).toBeDefined();
    expect(result.id).toBe('movie-id');
    expect(result.title).toBe('Test Movie');
    expect(movieRepository.findById).toHaveBeenCalledWith('movie-id');
  });

  it('should throw ApplicationException if movie not found', async () => {
    movieRepository.findById.mockResolvedValue(null);

    const query = new GetMovieByIdQuery('non-existent-id');

    await expect(handler.execute(query)).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationErrorCode.MOVIE_NOT_FOUND,
      }),
    );
  });

  it('should use cache via redis service', async () => {
    const query = new GetMovieByIdQuery('movie-id');

    await handler.execute(query);

    expect(redisService.getOrSetWithLock).toHaveBeenCalled();
  });
});
