import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, type TestingModule } from '@nestjs/testing';
import { ProviderType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
    };
  };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-access-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = { email: 'test@example.com', password: 'password123' };

    it('should register a new user successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const mockUser = {
        id: 'user-id',
        email: registerDto.email,
        role: Role.USER,
      };
      prisma.user.create.mockResolvedValue(mockUser);
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.register(registerDto);

      expect(result.user.email).toBe(registerDto.email);
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          authProviders: {
            create: {
              provider: ProviderType.LOCAL,
              passwordHash: 'hashed-password',
            },
          },
        },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should return user if credentials are valid', async () => {
      const mockUser = {
        id: 'user-id',
        email,
        role: Role.USER,
        authProviders: [
          {
            provider: ProviderType.LOCAL,
            passwordHash: 'hashed-password',
          },
        ],
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(email, password);

      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: 'user-id',
        email,
        authProviders: [
          {
            provider: ProviderType.LOCAL,
            passwordHash: 'hashed-password',
          },
        ],
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user has no local auth provider', async () => {
      const mockUser = {
        id: 'user-id',
        email,
        authProviders: [],
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.validateUser(email, password)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens for valid refresh token', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: Role.USER,
      };

      const mockStoredToken = {
        id: 'token-id',
        token: 'valid-refresh-token',
        expiresAt: new Date(Date.now() + 100000),
        user: mockUser,
      };

      prisma.refreshToken.findUnique.mockResolvedValue(mockStoredToken);
      prisma.refreshToken.delete.mockResolvedValue({});
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result.user.email).toBe(mockUser.email);
      expect(result.accessToken).toBe('mock-access-token');
      expect(prisma.refreshToken.delete).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const mockStoredToken = {
        id: 'token-id',
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 100000),
        user: { id: 'user-id' },
      };

      prisma.refreshToken.findUnique.mockResolvedValue(mockStoredToken);
      prisma.refreshToken.delete.mockResolvedValue({});

      await expect(service.refreshTokens('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should delete refresh token', async () => {
      prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      await service.logout('user-id', 'refresh-token');

      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          token: 'refresh-token',
        },
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        role: Role.USER,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById('user-id');

      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getUserById('non-existent');

      expect(result).toBeNull();
    });
  });
});
