export * from './create-movie.handler';
export * from './delete-movie.handler';
export * from './get-movie-by-id.handler';
export * from './get-movies.handler';
export * from './update-movie.handler';

import { CreateMovieHandler } from './create-movie.handler';
import { DeleteMovieHandler } from './delete-movie.handler';
import { GetMovieByIdHandler } from './get-movie-by-id.handler';
import { GetMoviesHandler } from './get-movies.handler';
import { UpdateMovieHandler } from './update-movie.handler';

export const CommandHandlers = [
  CreateMovieHandler,
  UpdateMovieHandler,
  DeleteMovieHandler,
];

export const QueryHandlers = [GetMoviesHandler, GetMovieByIdHandler];
