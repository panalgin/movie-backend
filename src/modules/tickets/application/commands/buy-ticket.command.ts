export class BuyTicketCommand {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
  ) {}
}
