import "dotenv/config";
import { neon, neonConfig } from "drizzle-orm/neon-js";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export {db,sql};
