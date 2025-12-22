import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/core/config/env";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
  db: ReturnType<typeof drizzle> | undefined;
};

export const getPool = () => {
  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({
      host: env.DB_HOST,
      port: Number(env.DB_PORT),
      user: env.DB_USER,
      password: env.DB_PASS,
      database: env.DB_NAME,
      ssl: env.APP_ENV === "production" ? { rejectUnauthorized: false } : false,
    });
  }

  return globalForDb.pool;
};

/**
 * Drizzle instance
 * Singleton (safe for dev & prod)
 */
export const DefaultServer = () => {
  if (!globalForDb.db) {
    const pool = getPool();
    globalForDb.db = drizzle(pool);
  }

  return globalForDb.db;
};
