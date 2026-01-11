import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateMovieDto } from './create-movie.dto';

export class BulkCreateMoviesDto {
  @ApiProperty({
    type: [CreateMovieDto],
    description: 'Array of movies to create',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateMovieDto)
  movies: CreateMovieDto[];
}

export class BulkDeleteMoviesDto {
  @ApiProperty({
    type: [String],
    description: 'Array of movie IDs to delete',
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids: string[];
}
