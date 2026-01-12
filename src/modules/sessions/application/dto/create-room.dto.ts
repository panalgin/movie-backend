import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Room number',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  number: number;

  @ApiProperty({
    description: 'Room capacity (default: 50)',
    example: 100,
    minimum: 1,
    maximum: 500,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  capacity?: number;
}
