export class UpdateMovieCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly releaseYear?: number,
    public readonly rating?: number,
  ) {}
}
