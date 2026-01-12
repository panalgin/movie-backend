import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TimeSlotEnum } from '../../../movies/domain/value-objects';

export class UpdateSessionDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Room ID',
  })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional({
    example: '2024-12-25',
    description: 'Session date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    enum: TimeSlotEnum,
    example: TimeSlotEnum.SLOT_14_16,
    description: 'Time slot',
  })
  @IsOptional()
  @IsEnum(TimeSlotEnum)
  timeSlot?: TimeSlotEnum;
}
