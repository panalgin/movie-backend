import { BaseEntity, DomainException } from '../../../../shared/domain';
import { UserAge } from '../value-objects';

export enum UserRole {
  MANAGER = 'MANAGER',
  CUSTOMER = 'CUSTOMER',
}

interface UserProps {
  username: string;
  email: string;
  phone: string | null;
  age: UserAge;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProps {
  username: string;
  email: string;
  phone?: string | null;
  age: number;
  role?: UserRole;
}

export class User extends BaseEntity<UserProps> {
  private constructor(id: string, props: UserProps) {
    super(id, props);
  }

  get username(): string {
    return this.props.username;
  }

  get email(): string {
    return this.props.email;
  }

  get phone(): string | null {
    return this.props.phone;
  }

  get age(): number {
    return this.props.age.value;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public static create(props: CreateUserProps): User {
    if (!props.username || props.username.trim().length < 3) {
      throw new DomainException('Username must be at least 3 characters');
    }

    if (!props.email || !props.email.includes('@')) {
      throw new DomainException('Invalid email format');
    }

    const userAge = UserAge.create(props.age);
    const now = new Date();

    return new User(crypto.randomUUID(), {
      username: props.username.trim(),
      email: props.email.toLowerCase().trim(),
      phone: props.phone?.trim() || null,
      age: userAge,
      role: props.role ?? UserRole.CUSTOMER,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static reconstitute(
    id: string,
    props: {
      username: string;
      email: string;
      phone: string | null;
      age: number;
      role: UserRole;
      createdAt: Date;
      updatedAt: Date;
    },
  ): User {
    return new User(id, {
      username: props.username,
      email: props.email,
      phone: props.phone,
      age: UserAge.create(props.age),
      role: props.role,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }

  public isManager(): boolean {
    return this.props.role === UserRole.MANAGER;
  }

  public isCustomer(): boolean {
    return this.props.role === UserRole.CUSTOMER;
  }

  public canWatchMovie(ageRestriction: number): boolean {
    return this.props.age.canWatch(ageRestriction);
  }
}
