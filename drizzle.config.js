import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  driver: 'pg',
  schema: './src/models/*.Model.js',
  out: './drizzle',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/smart_library',
  },
});
