import { ApiProperty } from '@nestjs/swagger';

export class MovieEntity {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier',
  })
  id: string;

  @ApiProperty({
    example: 'Inception',
    description: 'Movie title',
  })
  title: string;

  @ApiProperty({
    example: 'A mind-bending thriller about dream invasion',
    description: 'Movie description',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 2010,
    description: 'Release year',
    nullable: true,
  })
  releaseYear: number | null;

  @ApiProperty({
    example: 8.8,
    description: 'Movie rating (0-10)',
    nullable: true,
  })
  rating: number | null;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Last update timestamp',
  })
  updatedAt: Date;
}
