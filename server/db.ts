import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import { appConfig } from "./config";

const sqlite = new Database(appConfig.databaseUrl);
export const db = drizzle(sqlite, { schema });
