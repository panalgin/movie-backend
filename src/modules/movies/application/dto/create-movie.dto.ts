import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({
    example: 'Inception',
    description: 'Movie title',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({
    example: 'A mind-bending thriller about dream invasion',
    description: 'Movie description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 13,
    description: 'Age restriction (0-21)',
    minimum: 0,
    maximum: 21,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(21)
  ageRestriction?: number;
}
