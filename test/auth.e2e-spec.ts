import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean up
    await prisma.refreshToken.deleteMany();
    await prisma.authProvider.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.authProvider.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.role).toBe(Role.USER);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('should return 409 for duplicate email', async () => {
      // First registration
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'duplicate@example.com',
        password: 'password123',
      });

      // Second registration with same email
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password456',
        })
        .expect(409);

      expect(response.body.message).toBe('Email already registered');
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'short',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register a user first
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'login@example.com',
        password: 'password123',
      });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('login@example.com');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'me@example.com',
          password: 'password123',
        });

      accessToken = response.body.accessToken;
    });

    it('should return current user with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe('me@example.com');
      expect(response.body.role).toBe(Role.USER);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'refresh@example.com',
          password: 'password123',
        });

      refreshToken = response.body.refreshToken;
    });

    it('should return new tokens with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      // Old refresh token should be invalidated
      expect(response.body.refreshToken).not.toBe(refreshToken);
    });

    it('should return 401 with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);
    });
  });

  describe('Protected Routes (Movies)', () => {
    let userToken: string;
    let adminToken: string;

    beforeEach(async () => {
      // Create regular user
      const userResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'user@example.com',
          password: 'password123',
        });
      userToken = userResponse.body.accessToken;

      // Create admin user
      const adminResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      // Update to admin role directly in DB
      await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { role: Role.ADMIN },
      });

      // Re-login to get token with admin role
      const adminLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });
      adminToken = adminLoginResponse.body.accessToken;
    });

    describe('GET /movies (Public)', () => {
      it('should allow access without authentication', async () => {
        await request(app.getHttpServer()).get('/movies').expect(200);
      });
    });

    describe('POST /movies (Admin only)', () => {
      it('should allow admin to create movie', async () => {
        await request(app.getHttpServer())
          .post('/movies')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ title: 'Test Movie' })
          .expect(201);
      });

      it('should deny regular user from creating movie', async () => {
        await request(app.getHttpServer())
          .post('/movies')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ title: 'Test Movie' })
          .expect(403);
      });

      it('should deny unauthenticated user from creating movie', async () => {
        await request(app.getHttpServer())
          .post('/movies')
          .send({ title: 'Test Movie' })
          .expect(401);
      });
    });

    describe('DELETE /movies/:id (Admin only)', () => {
      let movieId: string;

      beforeEach(async () => {
        const movie = await prisma.movie.create({
          data: { title: 'Movie to Delete' },
        });
        movieId = movie.id;
      });

      afterEach(async () => {
        await prisma.movie.deleteMany();
      });

      it('should allow admin to delete movie', async () => {
        await request(app.getHttpServer())
          .delete(`/movies/${movieId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      });

      it('should deny regular user from deleting movie', async () => {
        await request(app.getHttpServer())
          .delete(`/movies/${movieId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });
    });
  });
});
