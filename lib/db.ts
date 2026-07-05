import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/db/schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDb | undefined;

/**
 * Lazily-initialized Drizzle client. Safe to import from anywhere — including
 * modules Next.js evaluates during `next build` — because the Neon client and
 * Drizzle instance are constructed only on first call, not at module load.
 * Only call this from inside a route handler / server action, never at
 * module scope.
 */
export function getDb(): DrizzleDb {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. getDb() must only be called at request time."
    );
  }

  _db = drizzle(neon(url), { schema });
  return _db;
}
