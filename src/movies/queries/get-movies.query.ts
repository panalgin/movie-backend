export class GetMoviesQuery {
  constructor(
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
