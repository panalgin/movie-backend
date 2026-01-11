export class GetSessionsQuery {
  constructor(
    public readonly movieId?: string,
    public readonly date?: Date,
    public readonly roomNumber?: number,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
