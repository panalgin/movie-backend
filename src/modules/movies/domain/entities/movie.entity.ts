import { BaseEntity, DomainException } from '../../../../shared/domain';
import { AgeRestriction } from '../value-objects';

interface MovieProps {
  title: string;
  description: string | null;
  ageRestriction: AgeRestriction;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMovieProps {
  title: string;
  description?: string;
  ageRestriction?: number;
}

export interface UpdateMovieProps {
  title?: string;
  description?: string;
  ageRestriction?: number;
}

export class Movie extends BaseEntity<MovieProps> {
  private constructor(id: string, props: MovieProps) {
    super(id, props);
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | null {
    return this.props.description;
  }

  get ageRestriction(): number {
    return this.props.ageRestriction.value;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public static create(props: CreateMovieProps): Movie {
    if (!props.title || props.title.trim().length < 1) {
      throw new DomainException('Movie title is required');
    }

    const now = new Date();
    const ageRestriction =
      props.ageRestriction !== undefined
        ? AgeRestriction.create(props.ageRestriction)
        : AgeRestriction.none();

    return new Movie(crypto.randomUUID(), {
      title: props.title.trim(),
      description: props.description?.trim() ?? null,
      ageRestriction,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(
    id: string,
    props: {
      title: string;
      description: string | null;
      ageRestriction: number;
      createdAt: Date;
      updatedAt: Date;
    },
  ): Movie {
    return new Movie(id, {
      title: props.title,
      description: props.description,
      ageRestriction: AgeRestriction.create(props.ageRestriction),
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  public update(props: UpdateMovieProps): Movie {
    const updatedProps = { ...this.props };

    if (props.title !== undefined) {
      if (props.title.trim().length < 1) {
        throw new DomainException('Movie title is required');
      }
      updatedProps.title = props.title.trim();
    }

    if (props.description !== undefined) {
      updatedProps.description = props.description?.trim() ?? null;
    }

    if (props.ageRestriction !== undefined) {
      updatedProps.ageRestriction = AgeRestriction.create(props.ageRestriction);
    }

    updatedProps.updatedAt = new Date();

    return new Movie(this._id, updatedProps);
  }

  public canBeWatchedBy(userAge: number): boolean {
    return this.props.ageRestriction.allowsAge(userAge);
  }
}
