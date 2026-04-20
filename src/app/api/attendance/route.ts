import { db } from '@/db';
import { attendances } from '@/db/schema';
import { NextResponse } from 'next/server';

// 🛑 GANTI DUA ANGKA INI DENGAN LOKASI ANDA SEKARANG
// Cara ambil dari Google Maps: Buka Maps di HP/Laptop -> Tahan/Klik lokasi Anda -> Copy angkanya
const KANTOR_LAT = -6.3844597; 
const KANTOR_LONG = 106.7649254;

export async function POST(req: Request) {
  try {
    const { userId, lat, long } = await req.json();
    
    // Hitung jarak aslinya
    const distance = Math.round(getDistance(lat, long, KANTOR_LAT, KANTOR_LONG));
    const isInside = distance <= 100; // Toleransi radius 100 meter

    const newAttendance = await db.insert(attendances).values({
      id: crypto.randomUUID(), // Wajib ada karena id adalah Primary Key
  userId: userId,
  tanggal: new Date(),
  statusHadir: isInside ? "HADIR" : "ALPA", // Sesuaikan statusnya
  jamMasuk: new Date().toLocaleTimeString("id-ID"),
}).returning();

    // Kirim balik data jarak ke HP
    return NextResponse.json({ 
      success: true, 
      valid: isInside, 
      distance: `${distance} meter`, // <-- Ini yang akan muncul di HP
      data: newAttendance 
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memproses" }, { status: 500 });
  }
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; 
  const p1 = lat1 * Math.PI/180, p2 = lat2 * Math.PI/180;
  const a = Math.sin(((lat2-lat1)*Math.PI/180)/2)**2 + Math.cos(p1) * Math.cos(p2) * Math.sin(((lon2-lon1)*Math.PI/180)/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))); 
}