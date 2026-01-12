import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/modules/auth/domain/entities';
import { TimeSlotEnum } from '../src/modules/movies/domain/value-objects';
import { PrismaService } from '../src/shared/infrastructure/prisma';

describe('Movie Management System (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  // Test data storage
  let customerToken: string;
  let managerToken: string;
  let movieId: string;
  let roomId: string;
  let sessionId: string;
  let ticketId: string;

  const customerUser = {
    username: 'test_customer',
    email: 'customer@test.com',
    password: 'password123',
    age: 25,
    role: UserRole.CUSTOMER,
  };

  const managerUser = {
    username: 'test_manager',
    email: 'manager@test.com',
    password: 'password123',
    age: 30,
    role: UserRole.MANAGER,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

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

    // Clean up test data
    await prisma.watchHistory.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.session.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.room.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.authProvider.deleteMany();
    await prisma.user.deleteMany();

    // Create default room for tests
    const room = await prisma.room.create({
      data: {
        number: 1,
        capacity: 50,
      },
    });
    roomId = room.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.watchHistory.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.session.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.room.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.authProvider.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
    await app.close();
  });

  describe('Auth', () => {
    describe('POST /auth/register/v1', () => {
      it('should register a customer', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register/v1')
          .send(customerUser)
          .expect(201);

        expect(response.body.user.username).toBe(customerUser.username);
        expect(response.body.user.email).toBe(customerUser.email);
        expect(response.body.user.role).toBe(UserRole.CUSTOMER);
        expect(response.body.accessToken).toBeDefined();
        customerToken = response.body.accessToken;
      });

      it('should register a manager', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/register/v1')
          .send(managerUser)
          .expect(201);

        expect(response.body.user.role).toBe(UserRole.MANAGER);
        managerToken = response.body.accessToken;
      });

      it('should reject duplicate email', async () => {
        await request(app.getHttpServer())
          .post('/auth/register/v1')
          .send(customerUser)
          .expect(409);
      });
    });

    describe('POST /auth/login/v1', () => {
      it('should login successfully', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login/v1')
          .send({
            email: customerUser.email,
            password: customerUser.password,
          })
          .expect(200);

        expect(response.body.accessToken).toBeDefined();
        customerToken = response.body.accessToken;
      });

      it('should reject invalid credentials', async () => {
        await request(app.getHttpServer())
          .post('/auth/login/v1')
          .send({
            email: customerUser.email,
            password: 'wrongpassword',
          })
          .expect(401);
      });
    });

    describe('GET /auth/me/v1', () => {
      it('should return current user', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/me/v1')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(response.body.username).toBe(customerUser.username);
      });

      it('should reject without token', async () => {
        await request(app.getHttpServer()).get('/auth/me/v1').expect(401);
      });
    });
  });

  describe('Movies', () => {
    describe('POST /movies/v1', () => {
      it('should allow manager to create movie', async () => {
        const response = await request(app.getHttpServer())
          .post('/movies/v1')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            title: 'Test Movie',
            description: 'A test movie',
            ageRestriction: 13,
          })
          .expect(201);

        expect(response.body.title).toBe('Test Movie');
        movieId = response.body.id;
      });

      it('should reject customer from creating movie', async () => {
        await request(app.getHttpServer())
          .post('/movies/v1')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            title: 'Another Movie',
          })
          .expect(403);
      });
    });

    describe('GET /movies/v1', () => {
      it('should list movies publicly', async () => {
        const response = await request(app.getHttpServer())
          .get('/movies/v1')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });

      it('should filter movies by age restriction', async () => {
        const response = await request(app.getHttpServer())
          .get('/movies/v1?maxAgeRestriction=18')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /movies/v1/:id', () => {
      it('should get movie by id', async () => {
        const response = await request(app.getHttpServer())
          .get(`/movies/v1/${movieId}`)
          .expect(200);

        expect(response.body.id).toBe(movieId);
      });

      it('should return 404 for non-existent movie', async () => {
        await request(app.getHttpServer())
          .get('/movies/v1/non-existent-id')
          .expect(404);
      });
    });
  });

  describe('Sessions', () => {
    describe('POST /sessions/v1', () => {
      it('should allow manager to create session', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);

        const response = await request(app.getHttpServer())
          .post('/sessions/v1')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            movieId,
            roomId,
            date: futureDate.toISOString().split('T')[0],
            timeSlot: TimeSlotEnum.SLOT_14_16,
          })
          .expect(201);

        expect(response.body.movieId).toBe(movieId);
        expect(response.body.roomId).toBe(roomId);
        sessionId = response.body.id;
      });

      it('should prevent double-booking', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);

        await request(app.getHttpServer())
          .post('/sessions/v1')
          .set('Authorization', `Bearer ${managerToken}`)
          .send({
            movieId,
            roomId,
            date: futureDate.toISOString().split('T')[0],
            timeSlot: TimeSlotEnum.SLOT_14_16,
          })
          .expect(409);
      });
    });

    describe('GET /sessions/v1', () => {
      it('should list sessions', async () => {
        const response = await request(app.getHttpServer())
          .get('/sessions/v1')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should filter sessions by movie', async () => {
        const response = await request(app.getHttpServer())
          .get(`/sessions/v1?movieId=${movieId}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(
          response.body.every(
            (s: { movieId: string }) => s.movieId === movieId,
          ),
        ).toBe(true);
      });
    });
  });

  describe('Tickets', () => {
    describe('POST /tickets/v1', () => {
      it('should allow customer to buy ticket', async () => {
        const response = await request(app.getHttpServer())
          .post('/tickets/v1')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            sessionId,
          })
          .expect(201);

        expect(response.body.sessionId).toBe(sessionId);
        ticketId = response.body.id;
      });

      it('should prevent duplicate ticket purchase', async () => {
        await request(app.getHttpServer())
          .post('/tickets/v1')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            sessionId,
          })
          .expect(409);
      });
    });

    describe('GET /tickets/v1/my', () => {
      it('should return user tickets', async () => {
        const response = await request(app.getHttpServer())
          .get('/tickets/v1/my')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Watch', () => {
    describe('POST /watch/v1', () => {
      it('should allow customer to watch movie with valid ticket', async () => {
        const response = await request(app.getHttpServer())
          .post('/watch/v1')
          .set('Authorization', `Bearer ${customerToken}`)
          .send({
            ticketId,
          })
          .expect(201);

        expect(response.body.movieId).toBe(movieId);
      });
    });

    describe('GET /watch/v1/history', () => {
      it('should return watch history', async () => {
        const response = await request(app.getHttpServer())
          .get('/watch/v1/history')
          .set('Authorization', `Bearer ${customerToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Room Capacity', () => {
    it('should prevent ticket purchase when room is full', async () => {
      // Create a room with capacity of 1
      const smallRoom = await prisma.room.create({
        data: {
          number: 99,
          capacity: 1,
        },
      });

      // Create a movie
      const capacityMovie = await prisma.movie.create({
        data: {
          title: 'Capacity Test Movie',
          ageRestriction: 0,
        },
      });

      // Create a session in the small room
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const sessionResponse = await request(app.getHttpServer())
        .post('/sessions/v1')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          movieId: capacityMovie.id,
          roomId: smallRoom.id,
          date: futureDate.toISOString().split('T')[0],
          timeSlot: TimeSlotEnum.SLOT_10_12,
        })
        .expect(201);

      const capacitySessionId = sessionResponse.body.id;

      // First customer buys ticket - should succeed
      await request(app.getHttpServer())
        .post('/tickets/v1')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          sessionId: capacitySessionId,
        })
        .expect(201);

      // Create second customer
      const secondCustomer = {
        username: 'second_customer',
        email: 'second@test.com',
        password: 'password123',
        age: 25,
      };

      const secondRegisterResponse = await request(app.getHttpServer())
        .post('/auth/register/v1')
        .send(secondCustomer)
        .expect(201);

      const secondCustomerToken = secondRegisterResponse.body.accessToken;

      // Second customer tries to buy ticket - should fail (sold out)
      await request(app.getHttpServer())
        .post('/tickets/v1')
        .set('Authorization', `Bearer ${secondCustomerToken}`)
        .send({
          sessionId: capacitySessionId,
        })
        .expect(409);
    });
  });

  describe('Age Restriction', () => {
    it('should prevent underage user from buying restricted movie ticket', async () => {
      // Create underage user
      const underageUser = {
        username: 'young_user',
        email: 'young@test.com',
        password: 'password123',
        age: 10,
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register/v1')
        .send(underageUser)
        .expect(201);

      const underageToken = registerResponse.body.accessToken;

      // Create restricted movie
      const restrictedMovieResponse = await request(app.getHttpServer())
        .post('/movies/v1')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          title: 'Adult Movie',
          ageRestriction: 18,
        })
        .expect(201);

      const restrictedMovieId = restrictedMovieResponse.body.id;

      // Create room for restricted session
      const room2 = await prisma.room.create({
        data: {
          number: 2,
          capacity: 50,
        },
      });

      // Create session for restricted movie
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 8);

      const sessionResponse = await request(app.getHttpServer())
        .post('/sessions/v1')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          movieId: restrictedMovieId,
          roomId: room2.id,
          date: futureDate.toISOString().split('T')[0],
          timeSlot: TimeSlotEnum.SLOT_20_22,
        })
        .expect(201);

      const restrictedSessionId = sessionResponse.body.id;

      // Underage user tries to buy ticket - should be forbidden
      await request(app.getHttpServer())
        .post('/tickets/v1')
        .set('Authorization', `Bearer ${underageToken}`)
        .send({
          sessionId: restrictedSessionId,
        })
        .expect(403);
    });
  });
});
