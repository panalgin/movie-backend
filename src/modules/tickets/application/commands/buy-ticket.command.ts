export class BuyTicketCommand {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
    public readonly quantity: number = 1,
    public readonly actorRole?: string,
  ) {}
}
