import { Test, type TestingModule } from '@nestjs/testing';
import { RedisService } from '../../../../shared/infrastructure';
import { Movie } from '../../domain/entities';
import { MOVIE_REPOSITORY } from '../../domain/repositories';
import { GetMoviesQuery } from '../queries';
import { GetMoviesHandler } from './get-movies.handler';

describe('GetMoviesHandler', () => {
  let handler: GetMoviesHandler;
  let movieRepository: Record<string, jest.Mock>;
  let redisService: Record<string, jest.Mock>;

  const mockMovies = [
    Movie.reconstitute('movie-1', {
      title: 'Movie 1',
      description: 'Desc 1',
      ageRestriction: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    Movie.reconstitute('movie-2', {
      title: 'Movie 2',
      description: 'Desc 2',
      ageRestriction: 13,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ];

  beforeEach(async () => {
    movieRepository = {
      findAll: jest.fn().mockResolvedValue(mockMovies),
    };

    redisService = {
      getOrSetWithLock: jest
        .fn()
        .mockImplementation((_key, fetcher) => fetcher()),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMoviesHandler,
        { provide: MOVIE_REPOSITORY, useValue: movieRepository },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    handler = module.get<GetMoviesHandler>(GetMoviesHandler);
  });

  it('should return movies list', async () => {
    const query = new GetMoviesQuery();

    const result = await handler.execute(query);

    expect(result).toHaveLength(2);
    expect(movieRepository.findAll).toHaveBeenCalled();
  });

  it('should pass query parameters to repository', async () => {
    const query = new GetMoviesQuery(10, 20, 'title', 'asc', 13);

    await handler.execute(query);

    expect(movieRepository.findAll).toHaveBeenCalledWith({
      skip: 10,
      take: 20,
      sortBy: 'title',
      sortOrder: 'asc',
      filterByAgeRestriction: 13,
    });
  });

  it('should use cache via redis service', async () => {
    const query = new GetMoviesQuery();

    await handler.execute(query);

    expect(redisService.getOrSetWithLock).toHaveBeenCalled();
  });
});
