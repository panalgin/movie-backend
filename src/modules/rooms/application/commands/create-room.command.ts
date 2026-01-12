export class CreateRoomCommand {
  constructor(
    public readonly number: number,
    public readonly capacity: number | undefined,
    public readonly actorId: string,
    public readonly actorRole: string,
  ) {}
}
