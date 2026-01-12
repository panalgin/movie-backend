# Movie Backend API

![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?logo=prisma)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger)
![License](https://img.shields.io/badge/License-MIT-green?logo=opensourceinitiative)

A NestJS-based movie management API following Domain-Driven Design (DDD) principles with CQRS pattern, role-based access control, and comprehensive testing.

## Test Coverage

| Type | Tests | Coverage |
|------|-------|----------|
| Unit | 120 | Domain entities, value objects, handlers & services |
| E2E | 26 | Full API integration tests |

```
Domain Layer Coverage:
├── Entities:     ~90% (User, Movie, Session, Room, Ticket, WatchHistory)
├── Value Objects: 100% (UserAge, TimeSlot, AgeRestriction)
├── Handlers:     ~85% (BuyTicket, CreateSession, UpdateSession, WatchMovie)
├── Services:     ~90% (AuthService)
└── Base Classes:  ~50% (BaseEntity, BaseValueObject)
```

## Features

### Core
- **User Registration & Login**: JWT authentication with refresh tokens
- **Role-Based Access Control**: Manager and Customer roles
- **Movie Management**: Full CRUD with age restrictions
- **Session Management**: Time slots with double-booking prevention
- **Room Management**: Capacity tracking and seat availability
- **Ticket System**: Age verification, capacity check, and purchase validation
- **Watch History**: Track watched movies with valid tickets
- **Bulk Operations**: Batch create/delete movies

### Infrastructure
- **Health Check**: `/health` endpoint for monitoring
- **Audit Logging**: Track all manager actions and auth events
- **Notifications**: Email (SendGrid) and SMS (Twilio) support
- **Caching**: Redis with thundering herd protection
- **Rate Limiting**: Throttling on sensitive endpoints
- **Typed Domain Errors**: Error codes for type-safe exception handling

## Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript 5.7
- **Database:** PostgreSQL 16
- **Cache:** Redis 7
- **ORM:** Prisma 7.2
- **Authentication:** JWT + Passport
- **Documentation:** Swagger/OpenAPI
- **Architecture:** DDD + CQRS
- **Linter/Formatter:** Biome
- **Commit Convention:** Conventional Commits
- **CI/CD:** GitHub Actions + Heroku

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
│   │   ├── domain.exception.ts          # Domain exceptions
│   │   └── domain-error-code.enum.ts    # Typed error codes
│   └── infrastructure/
│       ├── prisma/                      # Database layer
│       └── redis/                       # Cache layer
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
    │   ├── domain/
    │   │   └── entities/                # Session, Room entities
    │   └── ...
    ├── tickets/                         # Tickets Bounded Context
    ├── watch/                           # Watch History Bounded Context
    │
    ├── health/                          # Health Check Module
    ├── audit/                           # Audit Logging Module
    └── notifications/                   # Notifications Module
        ├── domain/
        │   ├── enums/                   # NotificationChannel, NotificationType
        │   └── interfaces/              # INotificationProvider
        └── infrastructure/
            └── providers/
                ├── email/               # SendGrid
                └── sms/                 # Twilio
```

## API Documentation

Swagger UI: **http://localhost:3000/swagger**

## API Endpoints

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | Public | Health check |

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
| `GET` | `/movies/v1` | Public | - | List movies (cached, with filtering/sorting) |
| `GET` | `/movies/v1/:id` | Public | - | Get movie by ID (cached) |
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
| `PUT` | `/sessions/v1/:id` | JWT | Manager | Update session |
| `DELETE` | `/sessions/v1/:id` | JWT | Manager | Delete session |

### Tickets

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/tickets/v1` | JWT | Customer | Buy tickets (quantity: 1-10, sends email) |
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
| `roomId` | uuid | Filter by room |

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
3. **Room Capacity**: Ticket sales are limited by room capacity (sold out when full)
4. **Ticket Validation**: Users can only watch movies they have tickets for
5. **Past Session Prevention**: Cannot create/update sessions to past time slots
6. **Multiple Ticket Purchase**: Users can buy 1-10 tickets per request (for friends/family)

## Domain Error Codes

The API uses typed error codes for consistent error handling:

| Category | Code | Description |
|----------|------|-------------|
| Validation | `MOVIE_TITLE_REQUIRED` | Movie title is required |
| Validation | `INVALID_EMAIL_FORMAT` | Invalid email format |
| Validation | `USERNAME_TOO_SHORT` | Username too short |
| Validation | `INVALID_AGE` | Age out of valid range |
| Validation | `INVALID_TIME_SLOT` | Invalid time slot value |
| Business | `SESSION_IN_PAST` | Session time is in the past |

## Audit Events

All significant actions are logged to the `audit_logs` table:

| Action | Trigger |
|--------|---------|
| `USER_REGISTER` | New user registration |
| `USER_LOGIN` | Successful login |
| `USER_LOGIN_FAILED` | Failed login attempt |
| `USER_LOGOUT` | User logout |
| `MOVIE_CREATE` | Movie created |
| `MOVIE_UPDATE` | Movie updated |
| `MOVIE_DELETE` | Movie deleted |
| `SESSION_CREATE` | Session created |
| `SESSION_UPDATE` | Session updated |
| `SESSION_DELETE` | Session deleted |
| `TICKET_PURCHASE` | Ticket purchased |

## Installation

### Prerequisites

- Node.js 22+
- Yarn
- Docker (for PostgreSQL and Redis)

### Steps

1. **Install dependencies:**
   ```bash
   yarn install
   ```

2. **Start PostgreSQL and Redis:**
   ```bash
   docker compose up -d
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Required variables:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movie_db?schema=public"
   JWT_SECRET="your-secret-key"
   REDIS_HOST="localhost"
   REDIS_PORT=6379
   ```
   
   Optional (for notifications):
   ```env
   SENDGRID_API_KEY=your-sendgrid-key
   SENDGRID_FROM_EMAIL=noreply@example.com
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_FROM_NUMBER=+1234567890
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
docker compose up -d
yarn test:e2e
```

### Coverage
```bash
yarn test:cov
```

## Architecture Decisions

### Domain-Driven Design (DDD)

- **Bounded Contexts**: Auth, Movies, Sessions, Tickets, Watch, Audit, Notifications
- **Rich Domain Models**: Entities with business logic
- **Value Objects**: TimeSlot, AgeRestriction, UserAge
- **Repository Pattern**: Abstract persistence layer
- **Typed Domain Errors**: Error codes for type-safe exception handling

### CQRS Pattern

- **Commands**: Write operations (CreateMovie, BuyTicket, etc.)
- **Queries**: Read operations (GetMovies, GetWatchHistory, etc.)
- **Handlers**: Process commands and queries

### Layered Architecture

- **Presentation**: Controllers, DTOs
- **Application**: Commands, Queries, Handlers
- **Domain**: Entities, Value Objects, Repository Interfaces
- **Infrastructure**: Repository Implementations, Database, Cache

### Caching Strategy

- **Thundering Herd Protection**: Redis locks prevent cache stampede
- **Cache TTL**: 30 seconds for movie listings
- **Cache Keys**: `movies:list:*`, `movies:detail:*`

## Deployment

The application is configured for Heroku deployment with:

- **GitHub Actions**: CI/CD pipeline
- **Procfile**: Web dyno configuration
- **Prisma Migrations**: Run on release

## License

MIT
