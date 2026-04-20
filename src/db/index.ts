import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

// Pastikan dia memanggil process.env di sini
const client = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

export const db = drizzle(client);