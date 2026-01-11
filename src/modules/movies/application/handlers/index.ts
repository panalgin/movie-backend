import { BulkCreateMoviesHandler } from './bulk-create-movies.handler';
import { BulkDeleteMoviesHandler } from './bulk-delete-movies.handler';
import { CreateMovieHandler } from './create-movie.handler';
import { DeleteMovieHandler } from './delete-movie.handler';
import { GetMovieByIdHandler } from './get-movie-by-id.handler';
import { GetMoviesHandler } from './get-movies.handler';
import { UpdateMovieHandler } from './update-movie.handler';

export const CommandHandlers = [
  CreateMovieHandler,
  UpdateMovieHandler,
  DeleteMovieHandler,
  BulkCreateMoviesHandler,
  BulkDeleteMoviesHandler,
];

export const QueryHandlers = [GetMoviesHandler, GetMovieByIdHandler];

export {
  CreateMovieHandler,
  UpdateMovieHandler,
  DeleteMovieHandler,
  BulkCreateMoviesHandler,
  BulkDeleteMoviesHandler,
  GetMoviesHandler,
  GetMovieByIdHandler,
};
