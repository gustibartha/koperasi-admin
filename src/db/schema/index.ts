import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    role: text("role").default("STAFF"), // STAFF, MANAGER
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
    // TAMBAHAN UNTUK LEAVE MANAGEMENT
    saldoCuti: integer("saldo_cuti").default(12),
    emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const leaves = sqliteTable('leaves', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull().references(() => user.id),
    jenisCuti: text('jenis_cuti').notNull(), 
    tanggalMulai: integer('tanggal_mulai', { mode: 'timestamp' }).notNull(),
    tanggalSelesai: integer('tanggal_selesai', { mode: 'timestamp' }).notNull(),
    alasan: text('alasan'),
    status: text('status').default('PENDING'), 
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    // Alur: PENDING -> APPROVED/REJECTED (Oleh Manajer)
    
});

export const attendances = sqliteTable('attendances', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull().references(() => user.id),
    latitude: integer('latitude'),
    longitude: integer('longitude'),
    checkIn: integer('check_in', { mode: 'timestamp' }),
    isValid: integer('is_valid', { mode: 'boolean' }),
});

export const performance = sqliteTable('performance', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull().references(() => user.id),
    periode: text('periode').notNull(), // Contoh: "April 2026"
    nilaiKinerja: integer("nilai_kinerja").default(0), // Skala 1-100
    catatan: text('catatan'),
    bonusInsentif: integer("bonus_insentif").default(0),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});