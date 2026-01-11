import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class GetSessionsDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filter by movie ID',
  })
  @IsOptional()
  @IsUUID()
  movieId?: string;

  @ApiPropertyOptional({
    example: '2024-12-25',
    description: 'Filter by date',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filter by room number',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number.parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1)
  roomNumber?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of records to skip',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number.parseInt(value, 10) : undefined))
  @IsInt()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of records to take',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number.parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1)
  take?: number;
}
