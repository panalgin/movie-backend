export class BulkDeleteMoviesCommand {
  constructor(
    public readonly ids: string[],
    public readonly actorId?: string,
    public readonly actorRole?: string,
  ) {}
}
