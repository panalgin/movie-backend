import type { TimeSlotEnum } from '../../../movies/domain/value-objects';

export class UpdateSessionCommand {
  constructor(
    public readonly id: string,
    public readonly roomId?: string,
    public readonly date?: Date,
    public readonly timeSlot?: TimeSlotEnum,
    public readonly actorId?: string,
    public readonly actorRole?: string,
  ) {}
}
