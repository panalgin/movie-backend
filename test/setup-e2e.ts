import { execSync } from 'node:child_process';

export default async () => {
  console.log('\n🔄 Setting up test database...');

  try {
    // Push schema to test database (will create tables if they don't exist)
    execSync('yarn db:push', {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });

    console.log('✅ Test database ready\n');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
};
