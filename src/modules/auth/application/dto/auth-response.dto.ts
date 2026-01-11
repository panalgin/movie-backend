import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../domain/entities';

class AuthUserDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 25 })
  age: number;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role: UserRole;
}

export class AuthResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token (expires in 15 minutes)',
  })
  accessToken: string;

  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description: 'Refresh token (expires in 7 days)',
  })
  refreshToken: string;
}
