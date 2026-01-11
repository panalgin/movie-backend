import { BaseEntity, DomainException } from '../../../../shared/domain';
import { TimeSlot, TimeSlotEnum } from '../../../movies/domain/value-objects';

interface SessionProps {
  movieId: string;
  date: Date;
  timeSlot: TimeSlot;
  roomNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionProps {
  movieId: string;
  date: Date;
  timeSlot: TimeSlotEnum;
  roomNumber: number;
}

export class Session extends BaseEntity<SessionProps> {
  private constructor(id: string, props: SessionProps) {
    super(id, props);
  }

  get movieId(): string {
    return this.props.movieId;
  }

  get date(): Date {
    return this.props.date;
  }

  get timeSlot(): TimeSlotEnum {
    return this.props.timeSlot.value;
  }

  get timeSlotLabel(): string {
    return this.props.timeSlot.label;
  }

  get roomNumber(): number {
    return this.props.roomNumber;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public static create(props: CreateSessionProps): Session {
    if (!props.movieId) {
      throw new DomainException('Movie ID is required');
    }

    if (!props.date) {
      throw new DomainException('Session date is required');
    }

    if (props.roomNumber < 1) {
      throw new DomainException('Room number must be at least 1');
    }

    const sessionDate = new Date(props.date);
    sessionDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today) {
      throw new DomainException('Session date cannot be in the past');
    }

    const now = new Date();

    return new Session(crypto.randomUUID(), {
      movieId: props.movieId,
      date: sessionDate,
      timeSlot: TimeSlot.create(props.timeSlot),
      roomNumber: props.roomNumber,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(
    id: string,
    props: {
      movieId: string;
      date: Date;
      timeSlot: TimeSlotEnum;
      roomNumber: number;
      createdAt: Date;
      updatedAt: Date;
    },
  ): Session {
    return new Session(id, {
      movieId: props.movieId,
      date: props.date,
      timeSlot: TimeSlot.create(props.timeSlot),
      roomNumber: props.roomNumber,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  public isPast(): boolean {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return this.props.date < now;
  }

  public isToday(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDate = new Date(this.props.date);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  }

  public conflictsWith(other: Session): boolean {
    const sameDate = this.props.date.getTime() === other.props.date.getTime();
    const sameTimeSlot = this.props.timeSlot.equals(other.props.timeSlot);
    const sameRoom = this.props.roomNumber === other.props.roomNumber;

    return sameDate && sameTimeSlot && sameRoom;
  }
}
