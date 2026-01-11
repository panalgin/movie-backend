import { BaseEntity, DomainException } from '../../../../shared/domain';

interface TicketProps {
  userId: string;
  sessionId: string;
  purchasedAt: Date;
}

export interface CreateTicketProps {
  userId: string;
  sessionId: string;
}

export class Ticket extends BaseEntity<TicketProps> {
  private constructor(id: string, props: TicketProps) {
    super(id, props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get sessionId(): string {
    return this.props.sessionId;
  }

  get purchasedAt(): Date {
    return this.props.purchasedAt;
  }

  public static create(props: CreateTicketProps): Ticket {
    if (!props.userId) {
      throw new DomainException('User ID is required');
    }

    if (!props.sessionId) {
      throw new DomainException('Session ID is required');
    }

    return new Ticket(crypto.randomUUID(), {
      userId: props.userId,
      sessionId: props.sessionId,
      purchasedAt: new Date(),
    });
  }

  public static reconstitute(
    id: string,
    props: {
      userId: string;
      sessionId: string;
      purchasedAt: Date;
    },
  ): Ticket {
    return new Ticket(id, {
      userId: props.userId,
      sessionId: props.sessionId,
      purchasedAt: props.purchasedAt,
    });
  }

  public belongsTo(userId: string): boolean {
    return this.props.userId === userId;
  }
}
