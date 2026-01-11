import { Movie } from '../entities';

export const MOVIE_REPOSITORY = Symbol('MOVIE_REPOSITORY');

export interface FindMoviesOptions {
  skip?: number;
  take?: number;
  sortBy?: 'title' | 'ageRestriction' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  filterByAgeRestriction?: number;
}

export interface IMovieRepository {
  findById(id: string): Promise<Movie | null>;
  findAll(options?: FindMoviesOptions): Promise<Movie[]>;
  save(movie: Movie): Promise<Movie>;
  update(movie: Movie): Promise<Movie>;
  delete(id: string): Promise<void>;
  count(options?: FindMoviesOptions): Promise<number>;
  saveMany(movies: Movie[]): Promise<Movie[]>;
  deleteMany(ids: string[]): Promise<void>;
}
