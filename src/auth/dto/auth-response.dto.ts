import type { Role } from '@prisma/client';

export class AuthResponseDto {
  user: {
    id: string;
    email: string;
    role: Role;
  };
  accessToken: string;
  refreshToken: string;
}
