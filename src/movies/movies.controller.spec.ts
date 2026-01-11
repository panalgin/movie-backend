import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, type TestingModule } from '@nestjs/testing';
import {
  CreateMovieCommand,
  DeleteMovieCommand,
  UpdateMovieCommand,
} from './commands';
import { MoviesController } from './movies.controller';
import { GetMovieByIdQuery, GetMoviesQuery } from './queries';

describe('MoviesController', () => {
  let controller: MoviesController;
  let commandBus: { execute: jest.Mock };
  let queryBus: { execute: jest.Mock };

  beforeEach(async () => {
    commandBus = { execute: jest.fn() };
    queryBus = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        { provide: CommandBus, useValue: commandBus },
        { provide: QueryBus, useValue: queryBus },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a movie via CommandBus', async () => {
      const dto = {
        title: 'Inception',
        description: 'A thriller',
        releaseYear: 2010,
        rating: 8.8,
      };

      const expectedMovie = { id: 'uuid-123', ...dto };
      commandBus.execute.mockResolvedValue(expectedMovie);

      const result = await controller.create(dto);

      expect(result).toEqual(expectedMovie);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateMovieCommand(
          dto.title,
          dto.description,
          dto.releaseYear,
          dto.rating,
        ),
      );
    });
  });

  describe('findAll', () => {
    it('should return all movies via QueryBus', async () => {
      const expectedMovies = [
        { id: 'uuid-1', title: 'Movie 1' },
        { id: 'uuid-2', title: 'Movie 2' },
      ];
      queryBus.execute.mockResolvedValue(expectedMovies);

      const result = await controller.findAll();

      expect(result).toEqual(expectedMovies);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetMoviesQuery(undefined, undefined),
      );
    });

    it('should pass pagination params to QueryBus', async () => {
      const expectedMovies = [{ id: 'uuid-1', title: 'Movie 1' }];
      queryBus.execute.mockResolvedValue(expectedMovies);

      const result = await controller.findAll('10', '5');

      expect(result).toEqual(expectedMovies);
      expect(queryBus.execute).toHaveBeenCalledWith(new GetMoviesQuery(10, 5));
    });
  });

  describe('findOne', () => {
    it('should return a movie by id via QueryBus', async () => {
      const expectedMovie = { id: 'uuid-123', title: 'Inception' };
      queryBus.execute.mockResolvedValue(expectedMovie);

      const result = await controller.findOne('uuid-123');

      expect(result).toEqual(expectedMovie);
      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetMovieByIdQuery('uuid-123'),
      );
    });

    it('should return null when movie not found', async () => {
      queryBus.execute.mockResolvedValue(null);

      const result = await controller.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a movie via CommandBus', async () => {
      const dto = {
        title: 'Updated Title',
        rating: 9.0,
      };

      const expectedMovie = { id: 'uuid-123', ...dto };
      commandBus.execute.mockResolvedValue(expectedMovie);

      const result = await controller.update('uuid-123', dto);

      expect(result).toEqual(expectedMovie);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateMovieCommand(
          'uuid-123',
          dto.title,
          dto.description,
          dto.releaseYear,
          dto.rating,
        ),
      );
    });
  });

  describe('remove', () => {
    it('should delete a movie via CommandBus', async () => {
      const expectedMovie = { id: 'uuid-123', title: 'Deleted Movie' };
      commandBus.execute.mockResolvedValue(expectedMovie);

      const result = await controller.remove('uuid-123');

      expect(result).toEqual(expectedMovie);
      expect(commandBus.execute).toHaveBeenCalledWith(
        new DeleteMovieCommand('uuid-123'),
      );
    });
  });
});
