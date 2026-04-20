import { db } from "@/db";
import { user, leaves } from "@/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Inisialisasi dengan tipe data yang jelas
  let activeLeaves: any[] = []; 
  let totalPegawai: number = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Math.floor(today.getTime() / 1000);

  try {
    const usersData = await db.select().from(user);
    totalPegawai = usersData.length;

    // Kueri database
    const result = await db
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
      
    activeLeaves = result;
      
  } catch (error) {
    console.error("Database error:", error);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Koperasi</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-600 p-6 rounded-xl text-white shadow-lg">
          <p className="text-sm opacity-80">Total Pegawai</p>
          <h2 className="text-4xl font-bold">{totalPegawai}</h2>
        </div>
        
        <div className="bg-emerald-600 p-6 rounded-xl text-white shadow-lg">
          <p className="text-sm opacity-80">Pegawai Cuti Hari Ini</p>
          <h2 className="text-4xl font-bold">{activeLeaves.length}</h2>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl text-white shadow-lg">
          <p className="text-sm opacity-80">Database Status</p>
          <h2 className="text-xl font-bold">Terhubung</h2>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold mb-4 text-slate-800 text-lg">Daftar Cuti Aktif</h3>
        {activeLeaves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-semibold">Nama Pegawai</th>
                  <th className="pb-3 font-semibold">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeLeaves.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 font-medium text-slate-700">{item.name || "Anonim"}</td>
                    <td className="py-3 text-slate-600">{item.jenis_cuti}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 italic">
            Tidak ada pegawai yang cuti hari ini.
          </div>
        )}
      </div>
    </div>
  );
}