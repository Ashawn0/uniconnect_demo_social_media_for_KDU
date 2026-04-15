import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";
import { appConfig } from "./config";

if (!appConfig.databaseUrl) {
  throw new Error("DATABASE_URL is required (Neon PostgreSQL connection string)");
}

export const pool = new Pool({
  connectionString: appConfig.databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: Number.parseInt(process.env.PG_POOL_MAX || "10", 10),
});

export const db = drizzle(pool, { schema });
