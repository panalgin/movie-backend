import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../../application';
import type { User } from '../../domain/entities';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') || 'super-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.authService.getUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}
