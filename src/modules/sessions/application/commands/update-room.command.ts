export class UpdateRoomCommand {
  constructor(
    public readonly id: string,
    public readonly capacity: number | undefined,
    public readonly actorId: string,
    public readonly actorRole: string,
  ) {}
}
