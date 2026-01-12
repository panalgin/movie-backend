export class DeleteMovieCommand {
  constructor(
    public readonly id: string,
    public readonly actorId?: string,
    public readonly actorRole?: string,
  ) {}
}
