# Movie Backend API

![Coverage](https://img.shields.io/badge/Coverage-58%25-yellow?logo=jest)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?logo=prisma)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?logo=swagger)
![License](https://img.shields.io/badge/License-MIT-green?logo=opensourceinitiative)

A NestJS-based movie management API with authentication, role-based access control, and CQRS pattern.

## Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript 5.7
- **Database:** PostgreSQL 16
- **ORM:** Prisma 7.2
- **Authentication:** JWT + Passport
- **Documentation:** Swagger/OpenAPI
- **Pattern:** CQRS (Command Query Responsibility Segregation)
- **Linter/Formatter:** Biome
- **Commit Convention:** Conventional Commits (commitlint + husky)

## Project Structure

```
src/
├── main.ts                     # Application entry point
├── app.module.ts               # Root module
├── app.controller.ts           # Root controller
├── app.service.ts              # Root service
│
├── prisma/                     # Prisma module
│   ├── prisma.module.ts        # Global Prisma module
│   ├── prisma.service.ts       # PrismaClient wrapper
│   └── index.ts
│
├── auth/                       # Authentication module
│   ├── auth.module.ts
│   ├── auth.controller.ts      # /auth endpoints
│   ├── auth.service.ts         # Auth business logic
│   ├── decorators/             # @Public, @Roles, @CurrentUser
│   ├── guards/                 # JwtAuthGuard, RolesGuard
│   ├── strategies/             # JWT, Local strategies
│   ├── dto/                    # Auth DTOs
│   ├── entities/               # User entity
│   └── index.ts
│
└── movies/                     # Movies feature module
    ├── movies.module.ts
    ├── movies.controller.ts    # REST controller
    ├── commands/               # CQRS Commands
    ├── queries/                # CQRS Queries
    ├── handlers/               # Command & Query handlers
    ├── dto/                    # Movie DTOs
    ├── entities/               # Movie entity
    └── index.ts
```

## API Documentation

Swagger UI is available at: **http://localhost:3000/swagger**

OpenAPI JSON: **http://localhost:3000/swagger-json**

## API Versioning

This API uses granular endpoint versioning:

```
/auth/register/v1    # Auth endpoints: /auth/{action}/v1
/movies/v1           # REST endpoints: /resource/v1
/movies/v1/:id
```

When a breaking change is introduced to an endpoint's signature, a new version (v2) will be released while v1 remains available.

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register/v1` | Public | Register new user |
| `POST` | `/auth/login/v1` | Public | Login with email/password |
| `POST` | `/auth/refresh/v1` | Public | Refresh access token |
| `GET` | `/auth/me/v1` | JWT | Get current user info |
| `POST` | `/auth/logout/v1` | JWT | Logout and invalidate refresh token |

### Movies

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/movies/v1` | Public | List all movies |
| `GET` | `/movies/v1/:id` | Public | Get movie by ID |
| `POST` | `/movies/v1` | Admin | Create a new movie |
| `PUT` | `/movies/v1/:id` | Admin | Update a movie |
| `DELETE` | `/movies/v1/:id` | Admin | Delete a movie |

### Query Parameters

For `GET /movies/v1`:
- `skip` - Number of records to skip (pagination)
- `take` - Number of records to take (pagination)

## Authentication

### JWT Bearer Token

1. Register or login to get `accessToken` and `refreshToken`
2. Use `Authorization: Bearer <accessToken>` header for protected routes
3. Access token expires in 15 minutes
4. Use `/auth/refresh/v1` with refresh token to get new tokens

### Roles

- **USER** - Default role, can view movies
- **ADMIN** - Can create, update, delete movies

### Request Examples

**Register:**
```bash
curl -X POST http://localhost:3000/auth/register/v1 \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login/v1 \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Create Movie (Admin):**
```bash
curl -X POST http://localhost:3000/movies/v1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"title": "Inception", "releaseYear": 2010, "rating": 8.8}'
```

## CQRS Pattern

This project implements the CQRS (Command Query Responsibility Segregation) pattern:

### Commands (Write Operations)
- `CreateMovieCommand` → Creates a new movie
- `UpdateMovieCommand` → Updates an existing movie
- `DeleteMovieCommand` → Deletes a movie

### Queries (Read Operations)
- `GetMoviesQuery` → Lists all movies (with pagination)
- `GetMovieByIdQuery` → Retrieves a single movie by ID

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
   # Edit .env with your values
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
  USER
  ADMIN
}

enum ProviderType {
  LOCAL
  GOOGLE
  APPLE
}

model User {
  id               String         @id @default(uuid())
  email            String         @unique
  role             Role           @default(USER)
  twoFactorEnabled Boolean        @default(false)
  authProviders    AuthProvider[]
  refreshTokens    RefreshToken[]
}

model AuthProvider {
  id           String       @id @default(uuid())
  userId       String
  provider     ProviderType
  providerId   String?
  passwordHash String?
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
}

model Movie {
  id          String   @id @default(uuid())
  title       String
  description String?
  releaseYear Int?
  rating      Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Scripts

| Script | Description |
|--------|-------------|
| `yarn start:dev` | Start in development mode (watch) |
| `yarn start:debug` | Start in debug mode |
| `yarn start:prod` | Start in production mode |
| `yarn build` | Build the project |
| `yarn db:generate` | Generate Prisma client |
| `yarn db:migrate` | Create and apply migrations |
| `yarn db:push` | Push schema to database |
| `yarn db:studio` | Open Prisma Studio |
| `yarn lint` | Run Biome linter |
| `yarn format` | Run Biome formatter |
| `yarn biome` | Lint + format + import sorting |
| `yarn test` | Run unit tests |
| `yarn test:watch` | Run unit tests in watch mode |
| `yarn test:cov` | Run unit tests with coverage |
| `yarn test:e2e` | Run E2E tests (requires test database) |

## Testing

### Unit Tests
```bash
yarn test           # Run once
yarn test:watch     # Watch mode
yarn test:cov       # With coverage
```

### E2E Tests
```bash
# Start test database
docker compose up -d movie-db-test

# Run E2E tests
yarn test:e2e
```

## Docker

```yaml
services:
  movie-db:
    image: postgres:16-alpine
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: movie_db

  movie-db-test:
    image: postgres:16-alpine
    ports:
      - '5433:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: movie_db_test
```

**Commands:**
```bash
docker compose up -d    # Start all
docker compose down     # Stop all
```

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

**Format:** `<type>: <description>`

**Types:** `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `style`, `perf`, `ci`

## License

This project is licensed under the [MIT License](LICENSE).
