/**
 * Local seed script - NOT version controlled
 * Run: yarn db:seed:local
 */

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, ProviderType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

const isProduction = process.env.NODE_ENV === 'production';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const MOVIE_TITLES = [
  'The Matrix',
  'Inception',
  'Interstellar',
  'The Dark Knight',
  'Pulp Fiction',
  'Fight Club',
  'Forrest Gump',
  'The Godfather',
  'Goodfellas',
  'The Shawshank Redemption',
  'Schindler\'s List',
  'The Lord of the Rings',
  'Star Wars',
  'Back to the Future',
  'Jurassic Park',
  'Gladiator',
  'Braveheart',
  'The Terminator',
  'Alien',
  'Blade Runner',
  'The Avengers',
  'Iron Man',
  'Spider-Man',
  'Batman Begins',
  'Superman',
  'Wonder Woman',
  'Aquaman',
  'Thor',
  'Black Panther',
  'Guardians of the Galaxy',
  'Deadpool',
  'X-Men',
  'Transformers',
  'Fast & Furious',
  'Mission Impossible',
  'James Bond',
  'John Wick',
  'Die Hard',
  'Lethal Weapon',
  'The Bourne Identity',
  'Mad Max',
  'Avatar',
  'Titanic',
  'E.T.',
  'Jaws',
  'Rocky',
  'Rambo',
  'Predator',
  'Robocop',
  'Total Recall',
];

async function main() {
  console.log('Starting seed...\n');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.watchHistory.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.session.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.room.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.authProvider.deleteMany();
  await prisma.user.deleteMany();
  await prisma.auditLog.deleteMany();
  console.log('Data cleared\n');

  // Create admin user
  console.log('Creating admin user...');
  const passwordHash = await bcrypt.hash('12345678', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@test.com',
      age: 30,
      role: Role.MANAGER,
      authProviders: {
        create: {
          provider: ProviderType.LOCAL,
          passwordHash,
        },
      },
    },
  });
  console.log(`Admin created: ${admin.email} / 12345678\n`);

  // Create 10 rooms
  console.log('Creating 10 rooms...');
  const rooms = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.room.create({
        data: {
          number: i + 1,
          capacity: Math.floor(Math.random() * 71) + 30, // 30-100
        },
      })
    )
  );
  console.log(`${rooms.length} rooms created (capacity 30-100)\n`);

  // Create 50 movies
  console.log('Creating 50 movies...');
  const movies = await Promise.all(
    MOVIE_TITLES.map((title, i) =>
      prisma.movie.create({
        data: {
          title: `${title} ${i > 0 ? `(${new Date().getFullYear()})` : ''}`.trim(),
          description: `A great movie about ${title.toLowerCase()}`,
          ageRestriction: [0, 7, 13, 16, 18][Math.floor(Math.random() * 5)],
        },
      })
    )
  );
  console.log(`${movies.length} movies created\n`);

  // Create sessions for next 7 days
  // SLOT_22_00 is kept empty for late-night maintenance
  console.log('Creating sessions for next 7 days...');
  const availableSlots = [
    'SLOT_10_12',
    'SLOT_12_14',
    'SLOT_14_16',
    'SLOT_16_18',
    'SLOT_18_20',
    'SLOT_20_22',
    // SLOT_22_00 intentionally excluded
  ] as const;

  let sessionCount = 0;
  for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
    // Start from tomorrow to avoid past session validation
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(0, 0, 0, 0);

    // Each room gets 4-6 random sessions per day (no double-booking)
    for (const room of rooms) {
      const sessionsPerDay = Math.floor(Math.random() * 3) + 4; // 4-6
      const shuffledSlots = [...availableSlots].sort(() => Math.random() - 0.5);
      const selectedSlots = shuffledSlots.slice(0, sessionsPerDay);

      for (const slot of selectedSlots) {
        const movie = movies[Math.floor(Math.random() * movies.length)];

        await prisma.session.create({
          data: {
            movieId: movie.id,
            roomId: room.id,
            date,
            timeSlot: slot,
          },
        });
        sessionCount++;
      }
    }
  }
  console.log(`${sessionCount} sessions created (SLOT_22_00 kept empty)\n`);

  console.log('Seed completed!');
  console.log('\nSummary:');
  console.log(`  - 1 admin user (admin@test.com / 12345678)`);
  console.log(`  - ${rooms.length} rooms`);
  console.log(`  - ${movies.length} movies`);
  console.log(`  - ${sessionCount} sessions`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
