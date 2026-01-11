import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma';

describe('Movies (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;

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

    // Create admin user for tests that require authentication
    await prisma.refreshToken.deleteMany();
    await prisma.authProvider.deleteMany();
    await prisma.user.deleteMany();

    await request(app.getHttpServer()).post('/auth/register/v1').send({
      email: 'admin@test.com',
      password: 'password123',
    });

    await prisma.user.update({
      where: { email: 'admin@test.com' },
      data: { role: Role.ADMIN },
    });

    // Re-login to get token with admin role
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login/v1')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });

    adminToken = loginResponse.body.accessToken;
  });

  beforeEach(async () => {
    // Clean up movies table before each test
    await prisma.movie.deleteMany();
  });

  afterAll(async () => {
    // Clean up and close
    await prisma.movie.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.authProvider.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /movies/v1', () => {
    it('should create a movie with all fields (admin)', async () => {
      const createDto = {
        title: 'Inception',
        description: 'A mind-bending thriller',
        releaseYear: 2010,
        rating: 8.8,
      };

      const response = await request(app.getHttpServer())
        .post('/movies/v1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        title: createDto.title,
        description: createDto.description,
        releaseYear: createDto.releaseYear,
        rating: createDto.rating,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should create a movie with only title (admin)', async () => {
      const createDto = {
        title: 'The Matrix',
      };

      const response = await request(app.getHttpServer())
        .post('/movies/v1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body.title).toBe(createDto.title);
      expect(response.body.description).toBeNull();
      expect(response.body.releaseYear).toBeNull();
      expect(response.body.rating).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .post('/movies/v1')
        .send({ title: 'Test Movie' })
        .expect(401);
    });
  });

  describe('GET /movies/v1', () => {
    beforeEach(async () => {
      // Create test movies
      await prisma.movie.createMany({
        data: [
          { title: 'Movie 1', releaseYear: 2020 },
          { title: 'Movie 2', releaseYear: 2021 },
          { title: 'Movie 3', releaseYear: 2022 },
        ],
      });
    });

    it('should return all movies (public)', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/v1')
        .expect(200);

      expect(response.body).toHaveLength(3);
    });

    it('should return movies with pagination (skip)', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/v1?skip=1')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return movies with pagination (take)', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/v1?take=2')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return movies with pagination (skip + take)', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/v1?skip=1&take=1')
        .expect(200);

      expect(response.body).toHaveLength(1);
    });

    it('should return empty array when no movies exist', async () => {
      await prisma.movie.deleteMany();

      const response = await request(app.getHttpServer())
        .get('/movies/v1')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /movies/v1/:id', () => {
    let movieId: string;

    beforeEach(async () => {
      const movie = await prisma.movie.create({
        data: {
          title: 'Test Movie',
          description: 'Test Description',
          releaseYear: 2023,
          rating: 7.5,
        },
      });
      movieId = movie.id;
    });

    it('should return a movie by id (public)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/movies/v1/${movieId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: movieId,
        title: 'Test Movie',
        description: 'Test Description',
        releaseYear: 2023,
        rating: 7.5,
      });
    });

    it('should return null for non-existent movie', async () => {
      const response = await request(app.getHttpServer())
        .get('/movies/v1/non-existent-uuid')
        .expect(200);

      expect(response.body).toEqual({});
    });
  });

  describe('PUT /movies/v1/:id', () => {
    let movieId: string;

    beforeEach(async () => {
      const movie = await prisma.movie.create({
        data: {
          title: 'Original Title',
          description: 'Original Description',
          releaseYear: 2020,
          rating: 7.0,
        },
      });
      movieId = movie.id;
    });

    it('should update a movie with all fields (admin)', async () => {
      const updateDto = {
        title: 'Updated Title',
        description: 'Updated Description',
        releaseYear: 2021,
        rating: 8.0,
      };

      const response = await request(app.getHttpServer())
        .put(`/movies/v1/${movieId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({
        id: movieId,
        title: updateDto.title,
        description: updateDto.description,
        releaseYear: updateDto.releaseYear,
        rating: updateDto.rating,
      });
    });

    it('should update a movie with partial fields (admin)', async () => {
      const updateDto = {
        title: 'Only Title Updated',
      };

      const response = await request(app.getHttpServer())
        .put(`/movies/v1/${movieId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.title).toBe(updateDto.title);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .put(`/movies/v1/${movieId}`)
        .send({ title: 'New Title' })
        .expect(401);
    });
  });

  describe('DELETE /movies/v1/:id', () => {
    let movieId: string;

    beforeEach(async () => {
      const movie = await prisma.movie.create({
        data: {
          title: 'Movie to Delete',
        },
      });
      movieId = movie.id;
    });

    it('should delete a movie (admin)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/movies/v1/${movieId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(movieId);

      // Verify it's deleted
      const deletedMovie = await prisma.movie.findUnique({
        where: { id: movieId },
      });
      expect(deletedMovie).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/movies/v1/${movieId}`)
        .expect(401);
    });
  });
});
