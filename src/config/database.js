import 'dotenv/config';
import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const neonLocalEnabled =
  process.env.NEON_LOCAL === 'true' ||
  process.env.NEON_LOCAL === true ||
  process.env.NEON_LOCAL === '1';

if (neonLocalEnabled) {
  neonConfig.fetchEndpoint =
    process.env.NEON_LOCAL_ENDPOINT || 'http://neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export { db, sql };
