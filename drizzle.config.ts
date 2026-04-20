import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
        url: process.env.TURSO_DATABASE_URL!,
        // 2. Paste Token Turso Anda di dalam tanda kutip ini (yang panjang diawali "ey...")
    authToken: process.env.TURSO_AUTH_TOKEN! 
  },
  verbose: true,
  strict: true
});