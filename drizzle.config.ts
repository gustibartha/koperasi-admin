import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema/index.ts', // Alamat folder tabel kita
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'file:./sqlite.db', // Nama file database yang akan dibuat
  },
});