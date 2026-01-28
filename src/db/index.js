import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../models/index.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/smart_library';

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool, { schema });

export default db;
