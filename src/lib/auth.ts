import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db"; // Ganti '@/db' jadi '../../db' jika sebelumnya error di jalan pintas

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
    emailAndPassword: {
        enabled: true, // INI YANG PALING PENTING
    },
});