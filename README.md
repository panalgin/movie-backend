# Movie Backend API

NestJS tabanlı, CQRS pattern kullanan bir film yönetim API'si.

## Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript 5.7
- **Database:** PostgreSQL 16
- **ORM:** Prisma 7.2
- **Pattern:** CQRS (Command Query Responsibility Segregation)
- **Linter/Formatter:** Biome
- **Commit Convention:** Conventional Commits (commitlint + husky)

## Proje Yapısı

```
src/
├── main.ts                     # Uygulama entry point
├── app.module.ts               # Root module
├── app.controller.ts           # Root controller
├── app.service.ts              # Root service
│
├── prisma/                     # Prisma modülü
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

Bu proje CQRS (Command Query Responsibility Segregation) pattern'ini kullanır:

### Commands (Yazma İşlemleri)
- `CreateMovieCommand` → Yeni film oluşturur
- `UpdateMovieCommand` → Mevcut filmi günceller
- `DeleteMovieCommand` → Filmi siler

### Queries (Okuma İşlemleri)
- `GetMoviesQuery` → Tüm filmleri listeler (pagination destekli)
- `GetMovieByIdQuery` → ID'ye göre tek film getirir

### Handler'lar
Her command/query için ayrı handler sınıfı bulunur. Handler'lar `@nestjs/cqrs` paketinin `CommandBus` ve `QueryBus` servisleri üzerinden çağrılır.

## Kurulum

### Gereksinimler
- Node.js 22+
- Yarn
- Docker (PostgreSQL için)

### Adımlar

1. **Bağımlılıkları yükle:**
   ```bash
   yarn install
   ```

2. **PostgreSQL'i başlat:**
   ```bash
   docker compose up -d
   ```

3. **Environment değişkenlerini ayarla:**
   ```bash
   # .env dosyası oluştur
   echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movie_db?schema=public"' > .env
   ```

4. **Database migration:**
   ```bash
   yarn db:push
   ```

5. **Uygulamayı başlat:**
   ```bash
   yarn start:dev
   ```

## Scriptler

| Script | Açıklama |
|--------|----------|
| `yarn start:dev` | Development modunda başlat (watch) |
| `yarn start:debug` | Debug modunda başlat |
| `yarn start:prod` | Production modunda başlat |
| `yarn build` | Projeyi derle |
| `yarn db:generate` | Prisma client oluştur |
| `yarn db:migrate` | Migration oluştur ve uygula |
| `yarn db:push` | Schema'yı DB'ye push et |
| `yarn db:studio` | Prisma Studio aç |
| `yarn lint` | Biome lint çalıştır |
| `yarn format` | Biome format çalıştır |
| `yarn biome` | Lint + format + import sorting |
| `yarn test` | Unit testleri çalıştır |
| `yarn test:e2e` | E2E testleri çalıştır |

## API Endpoints

### Movies

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/movies` | Tüm filmleri listele |
| `GET` | `/movies/:id` | ID'ye göre film getir |
| `POST` | `/movies` | Yeni film oluştur |
| `PUT` | `/movies/:id` | Filmi güncelle |
| `DELETE` | `/movies/:id` | Filmi sil |

### Query Parameters

`GET /movies` endpoint'i için:
- `skip` - Atlanacak kayıt sayısı (pagination)
- `take` - Alınacak kayıt sayısı (pagination)

### Request/Response Örnekleri

**Film Oluştur:**
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

**Filmleri Listele:**
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

Bu proje [Conventional Commits](https://www.conventionalcommits.org/) kullanır.

**Format:** `<type>: <description>`

**Tipler:**
- `feat` - Yeni özellik
- `fix` - Bug düzeltme
- `refactor` - Kod refactoring
- `docs` - Dokümantasyon
- `chore` - Bakım işleri
- `test` - Test ekleme/düzenleme
- `style` - Kod formatı
- `perf` - Performans iyileştirme
- `ci` - CI/CD değişiklikleri

**Örnek:**
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login redirect issue"
```

## Development Tools

### Biome
ESLint + Prettier alternatifi, tek araçta lint ve format.

```bash
yarn biome          # check + fix
yarn lint           # sadece lint
yarn format         # sadece format
```

### Husky + Commitlint
- `pre-commit` → Biome check çalıştırır
- `commit-msg` → Commit mesajını doğrular

## Docker

PostgreSQL için docker-compose.yml:

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

**Komutlar:**
```bash
docker compose up -d    # Başlat
docker compose down     # Durdur
docker compose logs -f  # Logları izle
```

## License

UNLICENSED
