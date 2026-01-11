# Movie Backend API

A NestJS-based movie management API using the CQRS pattern.

## Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript 5.7
- **Database:** PostgreSQL 16
- **ORM:** Prisma 7.2
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
│   └── index.ts                # Barrel export
│
└── movies/                     # Movies feature module
    ├── movies.module.ts        # Feature module
    ├── movies.controller.ts    # REST controller
    ├── index.ts                # Barrel export
    │
    ├── commands/               # CQRS Commands (write operations)
    │   ├── create-movie.command.ts
    │   ├── update-movie.command.ts
    │   ├── delete-movie.command.ts
    │   └── index.ts
    │
    ├── queries/                # CQRS Queries (read operations)
    │   ├── get-movies.query.ts
    │   ├── get-movie-by-id.query.ts
    │   └── index.ts
    │
    ├── handlers/               # Command & Query handlers
    │   ├── create-movie.handler.ts
    │   ├── update-movie.handler.ts
    │   ├── delete-movie.handler.ts
    │   ├── get-movies.handler.ts
    │   ├── get-movie-by-id.handler.ts
    │   └── index.ts
    │
    └── dto/                    # Data Transfer Objects
        ├── create-movie.dto.ts
        ├── update-movie.dto.ts
        └── index.ts

prisma/
└── schema.prisma               # Prisma schema

test/
├── app.e2e-spec.ts             # E2E tests
└── jest-e2e.json               # Jest E2E config
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

### Handlers
Each command/query has a dedicated handler class. Handlers are invoked through the `CommandBus` and `QueryBus` services from the `@nestjs/cqrs` package.

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
   # Create .env file
   echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movie_db?schema=public"' > .env
   ```

4. **Push database schema:**
   ```bash
   yarn db:push
   ```

5. **Start the application:**
   ```bash
   yarn start:dev
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
| `yarn test:e2e` | Run E2E tests |

## API Endpoints

### Movies

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/movies` | List all movies |
| `GET` | `/movies/:id` | Get movie by ID |
| `POST` | `/movies` | Create a new movie |
| `PUT` | `/movies/:id` | Update a movie |
| `DELETE` | `/movies/:id` | Delete a movie |

### Query Parameters

For `GET /movies` endpoint:
- `skip` - Number of records to skip (pagination)
- `take` - Number of records to take (pagination)

### Request/Response Examples

**Create Movie:**
```bash
curl -X POST http://localhost:3000/movies \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Inception",
    "description": "A thief who steals corporate secrets...",
    "releaseYear": 2010,
    "rating": 8.8
  }'
```

**List Movies:**
```bash
curl http://localhost:3000/movies?skip=0&take=10
```

## Database Schema

```prisma
model Movie {
  id          String   @id @default(uuid())
  title       String
  description String?
  releaseYear Int?
  rating      Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("movies")
}
```

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

**Format:** `<type>: <description>`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `docs` - Documentation
- `chore` - Maintenance tasks
- `test` - Adding/updating tests
- `style` - Code formatting
- `perf` - Performance improvements
- `ci` - CI/CD changes

**Examples:**
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login redirect issue"
```

## Development Tools

### Biome
An ESLint + Prettier alternative - lint and format in a single tool.

```bash
yarn biome          # check + fix
yarn lint           # lint only
yarn format         # format only
```

### Husky + Commitlint
- `pre-commit` → Runs Biome check
- `commit-msg` → Validates commit message format

## Docker

PostgreSQL docker-compose.yml:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: movie-db
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: movie_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

**Commands:**
```bash
docker compose up -d    # Start
docker compose down     # Stop
docker compose logs -f  # Follow logs
```

## License

UNLICENSED
