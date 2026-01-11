# Movie Backend API

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?logo=prisma)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger)
![License](https://img.shields.io/badge/License-MIT-green?logo=opensourceinitiative)

A NestJS-based movie management API following Domain-Driven Design (DDD) principles with CQRS pattern, role-based access control, and comprehensive testing.

## Features

- **User Registration & Login**: JWT authentication with refresh tokens
- **Role-Based Access Control**: Manager and Customer roles
- **Movie Management**: Full CRUD with age restrictions
- **Session Management**: Time slots with double-booking prevention
- **Ticket System**: Age verification and purchase validation
- **Watch History**: Track watched movies with valid tickets
- **Bulk Operations**: Batch create/delete movies

## Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript 5.7
- **Database:** PostgreSQL 16
- **ORM:** Prisma 7.2
- **Authentication:** JWT + Passport
- **Documentation:** Swagger/OpenAPI
- **Architecture:** DDD + CQRS
- **Linter/Formatter:** Biome
- **Commit Convention:** Conventional Commits

## Project Structure (DDD)

```
src/
├── main.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
│
├── shared/                              # Cross-cutting concerns
│   ├── domain/
│   │   ├── base.entity.ts               # Base entity class
│   │   ├── base.value-object.ts         # Base value object class
│   │   └── domain.exception.ts          # Domain exceptions
│   └── infrastructure/
│       └── prisma/                      # Database layer
│
└── modules/
    ├── auth/                            # Auth Bounded Context
    │   ├── application/
    │   │   ├── dto/                     # RegisterDto, LoginDto, etc.
    │   │   └── auth.service.ts          # Auth business logic
    │   ├── domain/
    │   │   ├── entities/                # User entity
    │   │   ├── value-objects/           # UserAge
    │   │   └── repositories/            # IUserRepository
    │   ├── infrastructure/
    │   │   └── persistence/             # PrismaUserRepository
    │   └── presentation/
    │       ├── auth.controller.ts
    │       ├── decorators/              # @Public, @Roles, @CurrentUser
    │       ├── guards/                  # JwtAuthGuard, RolesGuard
    │       └── strategies/              # JWT, Local strategies
    │
    ├── movies/                          # Movies Bounded Context
    │   ├── application/
    │   │   ├── commands/                # CreateMovie, UpdateMovie, etc.
    │   │   ├── queries/                 # GetMovies, GetMovieById
    │   │   ├── handlers/                # CQRS handlers
    │   │   └── dto/
    │   ├── domain/
    │   │   ├── entities/                # Movie entity
    │   │   ├── value-objects/           # TimeSlot, AgeRestriction
    │   │   └── repositories/            # IMovieRepository
    │   ├── infrastructure/
    │   │   └── persistence/             # PrismaMovieRepository
    │   └── presentation/
    │       └── movies.controller.ts
    │
    ├── sessions/                        # Sessions Bounded Context
    │   ├── application/
    │   ├── domain/
    │   ├── infrastructure/
    │   └── presentation/
    │
    ├── tickets/                         # Tickets Bounded Context
    │   ├── application/
    │   ├── domain/
    │   ├── infrastructure/
    │   └── presentation/
    │
    └── watch/                           # Watch History Bounded Context
        ├── application/
        ├── domain/
        ├── infrastructure/
        └── presentation/
```

## API Documentation

Swagger UI: **http://localhost:3000/swagger**

## API Endpoints

### Auth

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/auth/register/v1` | Public | - | Register new user |
| `POST` | `/auth/login/v1` | Public | - | Login |
| `POST` | `/auth/refresh/v1` | Public | - | Refresh tokens |
| `GET` | `/auth/me/v1` | JWT | All | Get current user |
| `POST` | `/auth/logout/v1` | JWT | All | Logout |

### Movies

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/movies/v1` | Public | - | List movies (with filtering/sorting) |
| `GET` | `/movies/v1/:id` | Public | - | Get movie by ID |
| `POST` | `/movies/v1` | JWT | Manager | Create movie |
| `PUT` | `/movies/v1/:id` | JWT | Manager | Update movie |
| `DELETE` | `/movies/v1/:id` | JWT | Manager | Delete movie |
| `POST` | `/movies/v1/bulk` | JWT | Manager | Bulk create movies |
| `DELETE` | `/movies/v1/bulk` | JWT | Manager | Bulk delete movies |

### Sessions

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/sessions/v1` | Public | - | List sessions |
| `GET` | `/sessions/v1/:id` | Public | - | Get session by ID |
| `POST` | `/sessions/v1` | JWT | Manager | Create session |
| `DELETE` | `/sessions/v1/:id` | JWT | Manager | Delete session |

### Tickets

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/tickets/v1` | JWT | Customer | Buy ticket |
| `GET` | `/tickets/v1/my` | JWT | Customer | Get my tickets |
| `GET` | `/tickets/v1/:id` | JWT | Customer | Get ticket by ID |

### Watch

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/watch/v1` | JWT | Customer | Watch movie |
| `GET` | `/watch/v1/history` | JWT | Customer | Get watch history |

## Query Parameters

### Movies (`GET /movies/v1`)

| Parameter | Type | Description |
|-----------|------|-------------|
| `skip` | number | Pagination offset |
| `take` | number | Pagination limit |
| `sortBy` | string | Sort by: `title`, `ageRestriction`, `createdAt` |
| `sortOrder` | string | Sort order: `asc`, `desc` |
| `maxAgeRestriction` | number | Filter by max age restriction |

### Sessions (`GET /sessions/v1`)

| Parameter | Type | Description |
|-----------|------|-------------|
| `movieId` | uuid | Filter by movie |
| `date` | date | Filter by date |
| `roomNumber` | number | Filter by room |

## Time Slots

Sessions use predefined time slots:

| Slot | Time |
|------|------|
| `SLOT_10_12` | 10:00-12:00 |
| `SLOT_12_14` | 12:00-14:00 |
| `SLOT_14_16` | 14:00-16:00 |
| `SLOT_16_18` | 16:00-18:00 |
| `SLOT_18_20` | 18:00-20:00 |
| `SLOT_20_22` | 20:00-22:00 |
| `SLOT_22_00` | 22:00-00:00 |

## Roles

- **MANAGER**: Can manage movies and sessions
- **CUSTOMER**: Can buy tickets and watch movies

## Business Rules

1. **Age Restriction**: Users cannot buy tickets for movies with age restriction higher than their age
2. **Double-Booking Prevention**: Same room cannot be booked for the same date and time slot
3. **Ticket Validation**: Users can only watch movies they have tickets for
4. **Past Session Prevention**: Cannot buy tickets for past sessions

## Installation

### Prerequisites

- Node.js 22+
- Yarn
- Docker (for PostgreSQL)

### Steps

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Start PostgreSQL:**
   ```bash
   docker compose up -d
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Required variables:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movie_db?schema=public"
   JWT_SECRET="your-secret-key"
   ```

4. **Push database schema:**
   ```bash
   yarn db:push
   ```

5. **Start the application:**
   ```bash
   yarn start:dev
   ```

6. **Open Swagger UI:**
   ```
   http://localhost:3000/swagger
   ```

## Database Schema

```prisma
enum Role {
  MANAGER
  CUSTOMER
}

enum TimeSlot {
  SLOT_10_12
  SLOT_12_14
  SLOT_14_16
  SLOT_16_18
  SLOT_18_20
  SLOT_20_22
  SLOT_22_00
}

model User {
  id        String   @id @default(uuid())
  username  String   @unique
  email     String   @unique
  age       Int
  role      Role     @default(CUSTOMER)
  // ... relations
}

model Movie {
  id             String    @id @default(uuid())
  title          String
  description    String?
  ageRestriction Int       @default(0)
  sessions       Session[]
}

model Session {
  id         String   @id @default(uuid())
  movieId    String
  date       DateTime
  timeSlot   TimeSlot
  roomNumber Int
  @@unique([date, timeSlot, roomNumber])
}

model Ticket {
  id        String @id @default(uuid())
  userId    String
  sessionId String
  @@unique([userId, sessionId])
}

model WatchHistory {
  id      String   @id @default(uuid())
  userId  String
  movieId String
}
```

## Scripts

| Script | Description |
|--------|-------------|
| `yarn start:dev` | Start in development mode |
| `yarn start:prod` | Start in production mode |
| `yarn build` | Build the project |
| `yarn db:generate` | Generate Prisma client |
| `yarn db:migrate` | Create and apply migrations |
| `yarn db:push` | Push schema to database |
| `yarn db:studio` | Open Prisma Studio |
| `yarn test` | Run unit tests |
| `yarn test:e2e` | Run E2E tests |
| `yarn test:cov` | Run tests with coverage |
| `yarn biome` | Lint + format |

## Testing

### Unit Tests
```bash
yarn test
```

### E2E Tests
```bash
docker compose up -d movie-db-test
yarn test:e2e
```

## Architecture Decisions

### Domain-Driven Design (DDD)

- **Bounded Contexts**: Auth, Movies, Sessions, Tickets, Watch
- **Rich Domain Models**: Entities with business logic
- **Value Objects**: TimeSlot, AgeRestriction, UserAge
- **Repository Pattern**: Abstract persistence layer

### CQRS Pattern

- **Commands**: Write operations (CreateMovie, BuyTicket, etc.)
- **Queries**: Read operations (GetMovies, GetWatchHistory, etc.)
- **Handlers**: Process commands and queries

### Layered Architecture

- **Presentation**: Controllers, DTOs
- **Application**: Commands, Queries, Handlers
- **Domain**: Entities, Value Objects, Repository Interfaces
- **Infrastructure**: Repository Implementations, Database

## License

MIT
