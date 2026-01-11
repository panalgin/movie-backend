import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateMovieDto {
  @ApiPropertyOptional({
    example: 'Inception',
    description: 'Movie title',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({
    example: 'A mind-bending thriller about dream invasion',
    description: 'Movie description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 2010,
    description: 'Release year',
    minimum: 1800,
    maximum: 2100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(2100)
  releaseYear?: number;

  @ApiPropertyOptional({
    example: 8.8,
    description: 'Movie rating',
    minimum: 0,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;
}
