import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateMovieDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(2100)
  releaseYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;
}
