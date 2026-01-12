import { BaseEntity, DomainException } from '../../../../shared/domain';

interface RoomProps {
  number: number;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoomProps {
  number: number;
  capacity?: number;
}

export class Room extends BaseEntity<RoomProps> {
  private constructor(id: string, props: RoomProps) {
    super(id, props);
  }

  get number(): number {
    return this.props.number;
  }

  get capacity(): number {
    return this.props.capacity;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public static create(props: CreateRoomProps): Room {
    if (props.number < 1) {
      throw new DomainException('Room number must be at least 1');
    }

    const capacity = props.capacity ?? 50;
    if (capacity < 1) {
      throw new DomainException('Room capacity must be at least 1');
    }

    const now = new Date();

    return new Room(crypto.randomUUID(), {
      number: props.number,
      capacity,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(
    id: string,
    props: {
      number: number;
      capacity: number;
      createdAt: Date;
      updatedAt: Date;
    },
  ): Room {
    return new Room(id, {
      number: props.number,
      capacity: props.capacity,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  public hasCapacityFor(currentTicketCount: number): boolean {
    return currentTicketCount < this.props.capacity;
  }

  public remainingCapacity(currentTicketCount: number): number {
    return Math.max(0, this.props.capacity - currentTicketCount);
  }
}
