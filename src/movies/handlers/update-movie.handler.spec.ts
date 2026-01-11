import { Test, type TestingModule } from '@nestjs/testing';
import {
  createMockPrismaService,
  type MockPrismaService,
} from '../../../test/mocks';
import { PrismaService } from '../../prisma';
import { UpdateMovieCommand } from '../commands';
import { UpdateMovieHandler } from './update-movie.handler';

describe('UpdateMovieHandler', () => {
  let handler: UpdateMovieHandler;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMovieHandler,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    handler = module.get<UpdateMovieHandler>(UpdateMovieHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should update a movie with all fields', async () => {
    const command = new UpdateMovieCommand(
      'uuid-123',
      'Inception Updated',
      'Updated description',
      2011,
      9.0,
    );

    const expectedMovie = {
      id: 'uuid-123',
      title: 'Inception Updated',
      description: 'Updated description',
      releaseYear: 2011,
      rating: 9.0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.movie.update.mockResolvedValue(expectedMovie);

    const result = await handler.execute(command);

    expect(result).toEqual(expectedMovie);
    expect(prisma.movie.update).toHaveBeenCalledWith({
      where: { id: 'uuid-123' },
      data: {
        title: 'Inception Updated',
        description: 'Updated description',
        releaseYear: 2011,
        rating: 9.0,
      },
    });
    expect(prisma.movie.update).toHaveBeenCalledTimes(1);
  });

  it('should update a movie with partial fields', async () => {
    const command = new UpdateMovieCommand('uuid-123', 'New Title');

    const expectedMovie = {
      id: 'uuid-123',
      title: 'New Title',
      description: 'Original description',
      releaseYear: 2010,
      rating: 8.8,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.movie.update.mockResolvedValue(expectedMovie);

    const result = await handler.execute(command);

    expect(result).toEqual(expectedMovie);
    expect(prisma.movie.update).toHaveBeenCalledWith({
      where: { id: 'uuid-123' },
      data: {
        title: 'New Title',
        description: undefined,
        releaseYear: undefined,
        rating: undefined,
      },
    });
  });
});
