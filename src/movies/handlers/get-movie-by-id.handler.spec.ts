import { Test, type TestingModule } from '@nestjs/testing';
import {
  createMockPrismaService,
  type MockPrismaService,
} from '../../../test/mocks';
import { PrismaService } from '../../prisma';
import { GetMovieByIdQuery } from '../queries';
import { GetMovieByIdHandler } from './get-movie-by-id.handler';

describe('GetMovieByIdHandler', () => {
  let handler: GetMovieByIdHandler;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMovieByIdHandler,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    handler = module.get<GetMovieByIdHandler>(GetMovieByIdHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should return a movie by id', async () => {
    const query = new GetMovieByIdQuery('uuid-123');

    const expectedMovie = {
      id: 'uuid-123',
      title: 'Inception',
      description: 'A mind-bending thriller',
      releaseYear: 2010,
      rating: 8.8,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.movie.findUnique.mockResolvedValue(expectedMovie);

    const result = await handler.execute(query);

    expect(result).toEqual(expectedMovie);
    expect(prisma.movie.findUnique).toHaveBeenCalledWith({
      where: { id: 'uuid-123' },
    });
    expect(prisma.movie.findUnique).toHaveBeenCalledTimes(1);
  });

  it('should return null when movie not found', async () => {
    const query = new GetMovieByIdQuery('non-existent-id');

    prisma.movie.findUnique.mockResolvedValue(null);

    const result = await handler.execute(query);

    expect(result).toBeNull();
    expect(prisma.movie.findUnique).toHaveBeenCalledWith({
      where: { id: 'non-existent-id' },
    });
  });
});
