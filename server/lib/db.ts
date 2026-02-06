import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL;

// Debug: log connection info at startup
if (databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    console.log(`[db] Connecting to database: ${url.host}${url.pathname}`);
  } catch {
    console.log(`[db] DATABASE_URL is set but cannot parse URL`);
  }
} else {
  console.warn(
    "DATABASE_URL not configured. Database operations will fail until configured."
  );
}

const sql = databaseUrl ? postgres(databaseUrl, { prepare: false }) : null;
export const db = sql ? drizzle(sql, { schema }) : null;

export function getDb() {
  if (!db) {
    throw new Error(
      "Database not initialized. Please configure DATABASE_URL environment variable."
    );
  }
  return db;
}
