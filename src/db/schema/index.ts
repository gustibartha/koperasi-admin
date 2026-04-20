import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 1. TABEL USER (PEGAWAI)
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").default("STAFF"), // STAFF, MANAGER, ADMIN
  email: text("email").notNull().unique(),
  jabatan: text("jabatan"),
  bidang: text("bidang"),
  subBidang: text("sub_bidang"),
  gajiPokok: integer("gaji_pokok").default(0),
  uangMakanSM: integer("uang_makan_sm").default(0),
  lemburan: integer("lemburan").default(0),
  jamsostek: integer("jamsostek").default(0),
  bpjsKesehatan: integer("bpjs_kesehatan").default(0),
  simpanPinjam: integer("simpan_pinjam").default(0),
  toko: integer("toko").default(0),
  lainLain: integer("lain_lain").default(0),
  saldoCuti: integer("saldo_cuti").default(12),
  emailVerified: integer("emailVerified", { mode: "boolean" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// 2. TABEL LEAVES (MANAJEMEN CUTI)
export const leaves = sqliteTable('leaves', {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  jenisCuti: text("jenis_cuti").notNull(),
  status: text("status").notNull().default('PENDING'), // PENDING, APPROVED, REJECTED
  tanggalMulai: integer("tanggal_mulai", { mode: "timestamp" }).notNull(),
  tanggalSelesai: integer("tanggal_selesai", { mode: "timestamp" }).notNull(),
  keterangan: text("keterangan"),
});

// 3. TABEL ABSENSI (UNTUK PAYROLL)
export const attendances = sqliteTable('attendances', {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  tanggal: integer("tanggal", { mode: "timestamp" }).notNull(),
  statusHadir: text("status_hadir").notNull(), // HADIR, SAKIT, IZIN, ALPA
  jamMasuk: text("jam_masuk"),
  jamKeluar: text("jam_keluar"),
});

// 4. TABEL KINERJA (PERFORMANCE)
export const performance = sqliteTable('performance', {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  bulan: text("bulan").notNull(), // Misalnya: "April 2026"
  nilai: integer("nilai").notNull(), // 0 - 100
  evaluasi: text("evaluasi"),
});