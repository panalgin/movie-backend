import { GetWatchHistoryHandler } from './get-watch-history.handler';
import { WatchMovieHandler } from './watch-movie.handler';

export const CommandHandlers = [WatchMovieHandler];

export const QueryHandlers = [GetWatchHistoryHandler];

export { WatchMovieHandler, GetWatchHistoryHandler };
