import { Test, type TestingModule } from '@nestjs/testing';
import {
  createMockPrismaService,
  type MockPrismaService,
} from '../../../test/mocks';
import { PrismaService } from '../../prisma';
import { DeleteMovieCommand } from '../commands';
import { DeleteMovieHandler } from './delete-movie.handler';

describe('DeleteMovieHandler', () => {
  let handler: DeleteMovieHandler;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteMovieHandler,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    handler = module.get<DeleteMovieHandler>(DeleteMovieHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should delete a movie by id', async () => {
    const command = new DeleteMovieCommand('uuid-123');

    const deletedMovie = {
      id: 'uuid-123',
      title: 'Inception',
      description: 'A mind-bending thriller',
      releaseYear: 2010,
      rating: 8.8,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prisma.movie.delete.mockResolvedValue(deletedMovie);

    const result = await handler.execute(command);

    expect(result).toEqual(deletedMovie);
    expect(prisma.movie.delete).toHaveBeenCalledWith({
      where: { id: 'uuid-123' },
    });
    expect(prisma.movie.delete).toHaveBeenCalledTimes(1);
  });
});
