export class UpdateMovieCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly description?: string,
    public readonly ageRestriction?: number,
    public readonly actorId?: string,
    public readonly actorRole?: string,
  ) {}
}
