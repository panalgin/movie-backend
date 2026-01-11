export class GetMoviesQuery {
  constructor(
    public readonly skip?: number,
    public readonly take?: number,
    public readonly sortBy?: 'title' | 'ageRestriction' | 'createdAt',
    public readonly sortOrder?: 'asc' | 'desc',
    public readonly filterByAgeRestriction?: number,
  ) {}
}
