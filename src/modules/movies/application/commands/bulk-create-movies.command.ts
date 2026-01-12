import type { CreateMovieDto } from '../dto';

export class BulkCreateMoviesCommand {
  constructor(
    public readonly movies: CreateMovieDto[],
    public readonly actorId?: string,
    public readonly actorRole?: string,
  ) {}
}
