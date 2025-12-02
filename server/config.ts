import path from "path";
import dotenv from "dotenv";

dotenv.config();

const resolveDatabasePath = (value?: string) => {
  if (!value || value.trim() === "") {
    return path.resolve(process.cwd(), "local.db");
  }
  // Allow absolute file paths as-is, resolve relative ones from repo root
  return path.isAbsolute(value) ? value : path.resolve(process.cwd(), value);
};

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const port = Number.parseInt(process.env.PORT || "3000", 10);
if (Number.isNaN(port)) {
  throw new Error("PORT environment variable must be a valid number");
}

export const appConfig = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  sessionSecret,
  databaseUrl: resolveDatabasePath(process.env.DATABASE_URL),
};
