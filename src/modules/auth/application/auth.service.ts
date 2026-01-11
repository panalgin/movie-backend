import { randomBytes } from 'node:crypto';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProviderType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../shared/infrastructure/prisma';
import { User, UserRole } from '../domain/entities';
import type { IUserRepository } from '../domain/repositories';
import { USER_REPOSITORY } from '../domain/repositories';
import type { AuthResponseDto, LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check if email exists
    if (await this.userRepository.existsByEmail(dto.email)) {
      throw new ConflictException('Email already registered');
    }

    // Check if username exists
    if (await this.userRepository.existsByUsername(dto.username)) {
      throw new ConflictException('Username already taken');
    }

    // Create domain user
    const user = User.create({
      username: dto.username,
      email: dto.email,
      age: dto.age,
      role: dto.role,
    });

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Save user with auth provider using Prisma directly for complex nested create
    const savedUser = await this.prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        age: user.age,
        role: user.role,
        authProviders: {
          create: {
            provider: ProviderType.LOCAL,
            passwordHash,
          },
        },
      },
    });

    return this.generateAuthResponse(
      User.reconstitute(savedUser.id, {
        username: savedUser.username,
        email: savedUser.email,
        age: savedUser.age,
        role: savedUser.role as UserRole,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      }),
    );
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        authProviders: {
          where: { provider: ProviderType.LOCAL },
        },
      },
    });

    if (!prismaUser || prismaUser.authProviders.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const authProvider = prismaUser.authProviders[0];
    if (!authProvider.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      authProvider.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = User.reconstitute(prismaUser.id, {
      username: prismaUser.username,
      email: prismaUser.email,
      age: prismaUser.age,
      role: prismaUser.role as UserRole,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });

    return this.generateAuthResponse(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Delete old refresh token
    await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const user = User.reconstitute(storedToken.user.id, {
      username: storedToken.user.username,
      email: storedToken.user.email,
      age: storedToken.user.age,
      role: storedToken.user.role as UserRole,
      createdAt: storedToken.user.createdAt,
      updatedAt: storedToken.user.updatedAt,
    });

    return this.generateAuthResponse(user);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });
  }

  async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  private async generateAuthResponse(user: User): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = randomBytes(32).toString('hex');

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        age: user.age,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}
