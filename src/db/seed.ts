import "dotenv/config"; 
import { db } from "./index";
import { user } from "./schema";

export async function seed() {
  console.log("Sedang membuat akun admin...");
  
  await db.insert(user).values([
    {
      id: "admin-01",
      name: "Admin Koperasi",
      email: "admin@koperasi.com",
      role: "MANAGER", // Sesuai dengan otorisasi dashboard Anda
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log("Akun Admin Berhasil Dibuat!");
}

seed();