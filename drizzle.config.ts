import { defineConfig } from "drizzle-kit";
import "dotenv/config";
import path from "path";

const resolveDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url || url.trim() === "") {
    return path.resolve(process.cwd(), "local.db");
  }
  return path.isAbsolute(url) ? url : path.resolve(process.cwd(), url);
};

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: resolveDatabaseUrl(),
  },
});
