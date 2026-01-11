import type { TimeSlotEnum } from '../../../movies/domain/value-objects';

export class CreateSessionCommand {
  constructor(
    public readonly movieId: string,
    public readonly date: Date,
    public readonly timeSlot: TimeSlotEnum,
    public readonly roomNumber: number,
  ) {}
}
