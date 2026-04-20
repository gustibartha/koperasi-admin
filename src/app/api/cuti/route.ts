import { NextResponse } from "next/server";
import { db } from "@/db";
import { leaves } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, jenisCuti, tanggalMulai, tanggalSelesai, keterangan } = body;

    // Masukkan data ke database Turso
    await db.insert(leaves).values({
      id: crypto.randomUUID(), // Bikin ID acak otomatis
      userId: userId || "bartha", // Default ke Pak Bartha sementara
      jenisCuti: jenisCuti,
      tanggalMulai: new Date(tanggalMulai),
      tanggalSelesai: new Date(tanggalSelesai),
      keterangan: keterangan,
      status: "PENDING", // Status awal pasti PENDING (Menunggu Persetujuan)
    });

    return NextResponse.json({ success: true, message: "Cuti berhasil diajukan" });
  } catch (error) {
    console.error("Error API Cuti:", error);
    return NextResponse.json({ success: false, error: "Gagal menyimpan data cuti" }, { status: 500 });
  }
}