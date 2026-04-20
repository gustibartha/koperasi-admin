import { db } from "@/db";
import { user, leaves, attendances } from "@/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";

// PAKSA halaman agar selalu mengambil data terbaru dari database
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // 1. Inisialisasi data dengan array kosong (Default)
  let activeLeaves = [];
  let totalPegawai = 0;
  let totalHadirHariIni = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Math.floor(today.getTime() / 1000);

  // 2. Gunakan TRY-CATCH agar jika tabel belum ada atau kueri error, website tidak mati
  try {
    // Ambil Total Pegawai
    const usersData = await db.select().from(user);
    totalPegawai = usersData.length;

    // Ambil Data Cuti yang disetujui untuk hari ini
    // Kita bungkus join ini karena ini yang paling sering bikin error 500
    activeLeaves = await db
      .select({
        name: user.name,
        jenis_cuti: leaves.jenisCuti,
        tanggal_mulai: leaves.tanggalMulai,
        tanggal_selesai: leaves.tanggalSelesai,
      })
      .from(leaves)
      .leftJoin(user, eq(leaves.userId, user.id))
      .where(
        and(
          eq(leaves.status, "APPROVED"),
          lte(leaves.tanggalMulai, todayTimestamp),
          gte(leaves.tanggalSelesai, todayTimestamp)
        )
      );
      
  } catch (error) {
    console.error("Terjadi masalah saat mengambil data dashboard:", error);
    // Kita biarkan variabel tetap pada nilai defaultnya agar halaman tidak crash
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Koperasi</h1>
      
      {/* KOTAK STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-500 p-4 rounded-lg text-white shadow">
          <p className="text-sm">Total Pegawai</p>
          <h2 className="text-3xl font-bold">{totalPegawai}</h2>
        </div>
        
        <div className="bg-green-500 p-4 rounded-lg text-white shadow">
          <p className="text-sm">Pegawai Cuti (Hari Ini)</p>
          <h2 className="text-3xl font-bold">{activeLeaves.length}</h2>
        </div>

        <div className="bg-orange-500 p-4 rounded-lg text-white shadow">
          <p className="text-sm">Status Database</p>
          <h2 className="text-lg font-bold">Terhubung ke Turso</h2>
        </div>
      </div>

      {/* TABEL PEGAWAI CUTI */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <h3 className="font-semibold mb-4 text-gray-700">Daftar Pegawai Cuti Aktif</h3>
        {activeLeaves.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2">Nama</th>
                <th className="py-2">Jenis Cuti</th>
              </tr>
            </thead>
            <tbody>
              {activeLeaves.map((item, index) => (
                <tr key={index} className="border-b last:border-0">
                  <td className="py-2">{item.name || "N/A"}</td>
                  <td className="py-2">{item.jenis_cuti}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-sm italic">Tidak ada pegawai yang cuti hari ini.</p>
        )}
      </div>
    </div>
  );
}