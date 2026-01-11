import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum SortBy {
  TITLE = 'title',
  AGE_RESTRICTION = 'ageRestriction',
  CREATED_AT = 'createdAt',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetMoviesDto {
  @ApiPropertyOptional({
    example: 0,
    description: 'Number of records to skip',
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number.parseInt(value, 10) : undefined))
  @IsInt()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of records to take',
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number.parseInt(value, 10) : undefined))
  @IsInt()
  @Min(1)
  take?: number;

  @ApiPropertyOptional({
    enum: SortBy,
    example: SortBy.CREATED_AT,
    description: 'Field to sort by',
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @ApiPropertyOptional({
    enum: SortOrder,
    example: SortOrder.DESC,
    description: 'Sort order',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({
    example: 18,
    description: 'Filter by maximum age restriction',
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number.parseInt(value, 10) : undefined))
  @IsInt()
  @Min(0)
  maxAgeRestriction?: number;
}
