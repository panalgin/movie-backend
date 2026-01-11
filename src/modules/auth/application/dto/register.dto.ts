import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../domain/entities';

export class RegisterDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username (min 3, max 50 characters)',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (min 8, max 100 characters)',
    minLength: 8,
    maxLength: 100,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @ApiProperty({
    example: 25,
    description: 'User age (1-120)',
    minimum: 1,
    maximum: 120,
  })
  @IsInt()
  @Min(1)
  @Max(120)
  age: number;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.CUSTOMER,
    description: 'User role (defaults to CUSTOMER)',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
