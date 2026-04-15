import dotenv from "dotenv";

dotenv.config();

const sessionSecret =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "development" ? "dev-session-secret-change-me" : undefined);
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
  databaseUrl: process.env.DATABASE_URL ?? "",
  clientUrl: process.env.CLIENT_URL ?? "",
};
