import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsUUID } from 'class-validator';
import { TimeSlotEnum } from '../../../movies/domain/value-objects';

export class CreateSessionDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Movie ID',
  })
  @IsUUID()
  movieId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Room ID',
  })
  @IsUUID()
  roomId: string;

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
}
