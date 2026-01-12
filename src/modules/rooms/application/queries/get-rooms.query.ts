export class GetRoomsQuery {
  constructor(
    public readonly skip: number = 0,
    public readonly take: number = 50,
  ) {}
}
