import { Test, type TestingModule } from '@nestjs/testing';
import {
  createMockPrismaService,
  type MockPrismaService,
} from '../../../test/mocks';
import { PrismaService } from '../../prisma';
import { GetMoviesQuery } from '../queries';
import { GetMoviesHandler } from './get-movies.handler';

describe('GetMoviesHandler', () => {
  let handler: GetMoviesHandler;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMoviesHandler,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    handler = module.get<GetMoviesHandler>(GetMoviesHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return all movies without pagination', async () => {
    const query = new GetMoviesQuery();

    const expectedMovies = [
      {
        id: 'uuid-1',
        title: 'Movie 1',
        description: 'Description 1',
        releaseYear: 2020,
        rating: 7.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'uuid-2',
        title: 'Movie 2',
        description: 'Description 2',
        releaseYear: 2021,
        rating: 8.0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prisma.movie.findMany.mockResolvedValue(expectedMovies);

    const result = await handler.execute(query);

    expect(result).toEqual(expectedMovies);
    expect(prisma.movie.findMany).toHaveBeenCalledWith({
      skip: undefined,
      take: undefined,
      orderBy: { createdAt: 'desc' },
    });
    expect(prisma.movie.findMany).toHaveBeenCalledTimes(1);
  });

  it('should return movies with pagination', async () => {
    const query = new GetMoviesQuery(10, 5);

    const expectedMovies = [
      {
        id: 'uuid-3',
        title: 'Movie 3',
        description: 'Description 3',
        releaseYear: 2022,
        rating: 8.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prisma.movie.findMany.mockResolvedValue(expectedMovies);

    const result = await handler.execute(query);

    expect(result).toEqual(expectedMovies);
    expect(prisma.movie.findMany).toHaveBeenCalledWith({
      skip: 10,
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return empty array when no movies exist', async () => {
    const query = new GetMoviesQuery();

    prisma.movie.findMany.mockResolvedValue([]);

    const result = await handler.execute(query);

    expect(result).toEqual([]);
    expect(prisma.movie.findMany).toHaveBeenCalledTimes(1);
  });
});
