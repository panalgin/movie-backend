import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../shared/infrastructure/prisma';
import { AuditService } from '../../audit/application';
import { UserRole } from '../domain/entities';
import { USER_REPOSITORY } from '../domain/repositories';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Record<string, jest.Mock>;
  let prismaService: Record<string, unknown>;
  let jwtService: Record<string, jest.Mock>;

  const mockUser = {
    id: 'user-id',
    username: 'testuser',
    email: 'test@test.com',
    phone: null,
    age: 25,
    role: 'CUSTOMER',
    createdAt: new Date(),
    updatedAt: new Date(),
    authProviders: [
      {
        id: 'provider-id',
        provider: 'LOCAL',
        passwordHash: 'hashed-password',
      },
    ],
  };

  beforeEach(async () => {
    userRepository = {
      existsByEmail: jest.fn().mockResolvedValue(false),
      existsByUsername: jest.fn().mockResolvedValue(false),
      findById: jest.fn(),
    };

    prismaService = {
      user: {
        create: jest.fn().mockResolvedValue(mockUser),
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({ token: 'refresh-token' }),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('access-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USER_REPOSITORY, useValue: userRepository },
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
        {
          provide: AuditService,
          useValue: { logSuccess: jest.fn(), logFailure: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123',
        age: 25,
      });

      expect(result).toBeDefined();
      expect(result.user.username).toBe('testuser');
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw ConflictException for duplicate email', async () => {
      userRepository.existsByEmail.mockResolvedValue(true);

      await expect(
        service.register({
          username: 'testuser',
          email: 'test@test.com',
          password: 'password123',
          age: 25,
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.register({
          username: 'testuser',
          email: 'test@test.com',
          password: 'password123',
          age: 25,
        }),
      ).rejects.toThrow('Email already registered');
    });

    it('should throw ConflictException for duplicate username', async () => {
      userRepository.existsByUsername.mockResolvedValue(true);

      await expect(
        service.register({
          username: 'testuser',
          email: 'test@test.com',
          password: 'password123',
          age: 25,
        }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.register({
          username: 'testuser',
          email: 'test@test.com',
          password: 'password123',
          age: 25,
        }),
      ).rejects.toThrow('Username already taken');
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result.user.email).toBe('test@test.com');
      expect(result.accessToken).toBe('access-token');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      (prismaService.user as Record<string, jest.Mock>).findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'wrong@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login({
          email: 'wrong@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@test.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
      await expect(
        service.login({
          email: 'test@test.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const storedToken = {
        id: 'token-id',
        token: 'valid-refresh-token',
        expiresAt: new Date(Date.now() + 86400000), // 1 day in future
        user: mockUser,
      };
      (prismaService.refreshToken as Record<string, jest.Mock>).findUnique.mockResolvedValue(storedToken);

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('access-token');
      expect((prismaService.refreshToken as Record<string, jest.Mock>).delete).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      (prismaService.refreshToken as Record<string, jest.Mock>).findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        'Invalid refresh token',
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const expiredToken = {
        id: 'token-id',
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 86400000), // 1 day in past
        user: mockUser,
      };
      (prismaService.refreshToken as Record<string, jest.Mock>).findUnique.mockResolvedValue(expiredToken);

      await expect(service.refreshTokens('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refreshTokens('expired-token')).rejects.toThrow(
        'Refresh token expired',
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      userRepository.findById.mockResolvedValue({
        id: 'user-id',
        role: UserRole.CUSTOMER,
      });

      await service.logout('user-id', 'refresh-token');

      expect((prismaService.refreshToken as Record<string, jest.Mock>).deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          token: 'refresh-token',
        },
      });
    });
  });
});
