import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma';
import { CreateMovieCommand } from '../commands';
import { CreateMovieHandler } from './create-movie.handler';
import {
  type MockPrismaService,
  createMockPrismaService,
} from '../../../test/mocks';

describe('CreateMovieHandler', () => {
  let handler: CreateMovieHandler;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMovieHandler,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    handler = module.get<CreateMovieHandler>(CreateMovieHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should create a movie with all fields', async () => {
    const command = new CreateMovieCommand(
      'Inception',
      'A mind-bending thriller',
      2010,
      8.8,
    );

    const expectedMovie = {
      id: 'uuid-123',
      title: 'Inception',
      description: 'A mind-bending thriller',
      releaseYear: 2010,
      rating: 8.8,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.movie.create.mockResolvedValue(expectedMovie);

    const result = await handler.execute(command);

    expect(result).toEqual(expectedMovie);
    expect(prisma.movie.create).toHaveBeenCalledWith({
      data: {
        title: 'Inception',
        description: 'A mind-bending thriller',
        releaseYear: 2010,
        rating: 8.8,
      },
    });
    expect(prisma.movie.create).toHaveBeenCalledTimes(1);
  });

  it('should create a movie with only required fields', async () => {
    const command = new CreateMovieCommand('The Matrix');

    const expectedMovie = {
      id: 'uuid-456',
      title: 'The Matrix',
      description: undefined,
      releaseYear: undefined,
      rating: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.movie.create.mockResolvedValue(expectedMovie);

    const result = await handler.execute(command);

    expect(result).toEqual(expectedMovie);
    expect(prisma.movie.create).toHaveBeenCalledWith({
      data: {
        title: 'The Matrix',
        description: undefined,
        releaseYear: undefined,
        rating: undefined,
      },
    });
  });
});
