export class GetSessionsQuery {
  constructor(
    public readonly movieId?: string,
    public readonly roomId?: string,
    public readonly date?: Date,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
