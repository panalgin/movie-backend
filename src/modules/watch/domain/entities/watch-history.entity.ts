import { BaseEntity, DomainException } from '../../../../shared/domain';

interface WatchHistoryProps {
  userId: string;
  movieId: string;
  watchedAt: Date;
}

export interface CreateWatchHistoryProps {
  userId: string;
  movieId: string;
}

export class WatchHistory extends BaseEntity<WatchHistoryProps> {
  private constructor(id: string, props: WatchHistoryProps) {
    super(id, props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get movieId(): string {
    return this.props.movieId;
  }

  get watchedAt(): Date {
    return this.props.watchedAt;
  }

  public static create(props: CreateWatchHistoryProps): WatchHistory {
    if (!props.userId) {
      throw new DomainException('User ID is required');
    }

    if (!props.movieId) {
      throw new DomainException('Movie ID is required');
    }

    return new WatchHistory(crypto.randomUUID(), {
      userId: props.userId,
      movieId: props.movieId,
      watchedAt: new Date(),
    });
  }

  public static reconstitute(
    id: string,
    props: {
      userId: string;
      movieId: string;
      watchedAt: Date;
    },
  ): WatchHistory {
    return new WatchHistory(id, {
      userId: props.userId,
      movieId: props.movieId,
      watchedAt: props.watchedAt,
    });
  }

  public belongsTo(userId: string): boolean {
    return this.props.userId === userId;
  }
}
