import {
  BaseEntity,
  DomainErrorCode,
  DomainException,
} from '../../../../shared/domain';
import { TimeSlot, TimeSlotEnum } from '../../../movies/domain/value-objects';

interface SessionProps {
  movieId: string;
  roomId: string;
  date: Date;
  timeSlot: TimeSlot;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionProps {
  movieId: string;
  roomId: string;
  date: Date;
  timeSlot: TimeSlotEnum;
}

export class Session extends BaseEntity<SessionProps> {
  private constructor(id: string, props: SessionProps) {
    super(id, props);
  }

  private static validateNotInPast(date: Date, timeSlot: TimeSlot): void {
    const now = new Date();
    const sessionDateTime = new Date(date);
    sessionDateTime.setHours(timeSlot.startHour, 0, 0, 0);

    if (sessionDateTime < now) {
      throw new DomainException(
        DomainErrorCode.SESSION_IN_PAST,
        'Session time cannot be in the past',
      );
    }
  }

  get movieId(): string {
    return this.props.movieId;
  }

  get roomId(): string {
    return this.props.roomId;
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

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public static create(props: CreateSessionProps): Session {
    if (!props.movieId) {
      throw new DomainException(
        DomainErrorCode.MOVIE_ID_REQUIRED,
        'Movie ID is required',
      );
    }

    if (!props.roomId) {
      throw new DomainException(
        DomainErrorCode.ROOM_ID_REQUIRED,
        'Room ID is required',
      );
    }

    if (!props.date) {
      throw new DomainException(
        DomainErrorCode.SESSION_DATE_REQUIRED,
        'Session date is required',
      );
    }

    const sessionDate = new Date(props.date);
    sessionDate.setHours(0, 0, 0, 0);

    const timeSlot = TimeSlot.create(props.timeSlot);
    Session.validateNotInPast(sessionDate, timeSlot);

    const now = new Date();

    return new Session(crypto.randomUUID(), {
      movieId: props.movieId,
      roomId: props.roomId,
      date: sessionDate,
      timeSlot,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(
    id: string,
    props: {
      movieId: string;
      roomId: string;
      date: Date;
      timeSlot: TimeSlotEnum;
      createdAt: Date;
      updatedAt: Date;
    },
  ): Session {
    return new Session(id, {
      movieId: props.movieId,
      roomId: props.roomId,
      date: props.date,
      timeSlot: TimeSlot.create(props.timeSlot),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  public isPast(): boolean {
    const now = new Date();
    const sessionDateTime = new Date(this.props.date);
    sessionDateTime.setHours(this.props.timeSlot.startHour, 0, 0, 0);
    return sessionDateTime < now;
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
    const sameRoom = this.props.roomId === other.props.roomId;

    return sameDate && sameTimeSlot && sameRoom;
  }

  public update(props: {
    roomId?: string;
    date?: Date;
    timeSlot?: TimeSlotEnum;
  }): Session {
    // Cannot update a past session
    if (this.isPast()) {
      throw new DomainException(
        DomainErrorCode.SESSION_IN_PAST,
        'Cannot update a session that has already passed',
      );
    }

    let newDate = this.props.date;
    if (props.date) {
      const sessionDate = new Date(props.date);
      sessionDate.setHours(0, 0, 0, 0);
      newDate = sessionDate;
    }

    const newTimeSlot = props.timeSlot
      ? TimeSlot.create(props.timeSlot)
      : this.props.timeSlot;

    // Validate the new date/time combination is not in the past
    Session.validateNotInPast(newDate, newTimeSlot);

    return new Session(this._id, {
      movieId: this.props.movieId,
      roomId: props.roomId ?? this.props.roomId,
      date: newDate,
      timeSlot: newTimeSlot,
      createdAt: this.props.createdAt,
      updatedAt: new Date(),
    });
  }
}
