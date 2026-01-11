import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsUUID, Min } from 'class-validator';
import { TimeSlotEnum } from '../../../movies/domain/value-objects';

export class CreateSessionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Movie ID',
  })
  @IsUUID()
  movieId: string;

  @ApiProperty({
    example: '2024-12-25',
    description: 'Session date (YYYY-MM-DD)',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    enum: TimeSlotEnum,
    example: TimeSlotEnum.SLOT_14_16,
    description: 'Time slot',
  })
  @IsEnum(TimeSlotEnum)
  timeSlot: TimeSlotEnum;

  @ApiProperty({
    example: 1,
    description: 'Room number',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  roomNumber: number;
}
