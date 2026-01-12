import {
  DomainErrorCode,
  DomainException,
  ValueObject,
} from '../../../../shared/domain';

interface UserAgeProps {
  value: number;
}

export class UserAge extends ValueObject<UserAgeProps> {
  private static readonly MIN_AGE = 1;
  private static readonly MAX_AGE = 120;

  private constructor(props: UserAgeProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }

  public static create(value: number): UserAge {
    if (!Number.isInteger(value)) {
      throw new DomainException(
        DomainErrorCode.INVALID_AGE,
        'Age must be an integer',
      );
    }
    if (value < UserAge.MIN_AGE || value > UserAge.MAX_AGE) {
      throw new DomainException(
        DomainErrorCode.INVALID_AGE,
        `Age must be between ${UserAge.MIN_AGE} and ${UserAge.MAX_AGE}`,
      );
    }
    return new UserAge({ value });
  }

  public isAdult(): boolean {
    return this.value >= 18;
  }

  public canWatch(ageRestriction: number): boolean {
    return this.value >= ageRestriction;
  }
}
