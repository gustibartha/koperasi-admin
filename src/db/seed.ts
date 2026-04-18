import { db } from "./index";
import { user } from "./schema";

async function seed() {
  console.log("Sedang mengisi data pegawai...");
  
  await db.insert(users).values([
    {
      id: "emp-01",
      name: "Budi Santoso",
      email: "budi@koperasi.com",
      role: "admin",
      jabatan: "Kepala Admin",
      phoneNumber: "08123456789"
    },
    {
      id: "emp-02",
      name: "Siti Aminah",
      email: "siti@koperasi.com",
      role: "employee",
      jabatan: "Staff Lapangan",
      phoneNumber: "08987654321"
    }
  ]);

  console.log("Data berhasil dimasukkan!");
}

seed();