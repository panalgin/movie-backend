import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class UpdateRoomDto {
  @ApiProperty({
    description: 'Room capacity',
    example: 120,
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
