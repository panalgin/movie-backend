import { DomainException, ValueObject } from '../../../../shared/domain';

interface AgeRestrictionProps {
  value: number;
}

export class AgeRestriction extends ValueObject<AgeRestrictionProps> {
  private static readonly MIN_AGE = 0;
  private static readonly MAX_AGE = 21;

  private constructor(props: AgeRestrictionProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }

  public static create(value: number): AgeRestriction {
    if (value < AgeRestriction.MIN_AGE || value > AgeRestriction.MAX_AGE) {
      throw new DomainException(
        `Age restriction must be between ${AgeRestriction.MIN_AGE} and ${AgeRestriction.MAX_AGE}`,
      );
    }
    return new AgeRestriction({ value });
  }

  public static none(): AgeRestriction {
    return new AgeRestriction({ value: 0 });
  }

  public allowsAge(userAge: number): boolean {
    return userAge >= this.value;
  }

  public toString(): string {
    if (this.value === 0) {
      return 'All ages';
    }
    return `${this.value}+`;
  }
}
