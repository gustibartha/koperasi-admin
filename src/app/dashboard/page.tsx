import { db } from "@/db";
import { user, leaves } from "@/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import DashboardAnalytics from "@/components/DashboardAnalytics"; 

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let activeLeaves: any[] = []; 
  let totalPegawai: number = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const usersData = await db.select().from(user);
    totalPegawai = usersData.length;

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
          lte(leaves.tanggalMulai, today), 
          gte(leaves.tanggalSelesai, today)
        )
      );
      
    activeLeaves = result;
      
  } catch (error) {
    console.error("Database error:", error);
  }

  // Format data kehadiran dinamis untuk dikirim ke Chart
  const dataKehadiranChart = [
    { name: 'Masuk', value: totalPegawai - activeLeaves.length },
    { name: 'Cuti', value: activeLeaves.length },
  ];

  // Data dummy untuk gaji (bisa diubah nanti jika tabel payroll sudah siap di Turso)
  const dataGajiChart = [
    { bulan: 'Jan', totalGaji: 45000000 },
    { bulan: 'Feb', totalGaji: 46500000 },
    { bulan: 'Mar', totalGaji: 44000000 },
    { bulan: 'Apr', totalGaji: 48000000 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Dashboard Koperasi</h1>
      
      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-blue-100 text-sm font-medium">Total Pegawai</p>
          <h2 className="text-4xl font-extrabold mt-1">{totalPegawai}</h2>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-emerald-100 text-sm font-medium">Pegawai Cuti Hari Ini</p>
          <h2 className="text-4xl font-extrabold mt-1">{activeLeaves.length}</h2>
        </div>

        <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-6 rounded-2xl text-white shadow-lg">
          <p className="text-slate-300 text-sm font-medium">Status Sistem</p>
          <h2 className="text-xl font-bold mt-2">Operasional</h2>
        </div>
      </div>

      {/* 2. AREA GRAFIK RECHARTS */}
      <div className="mb-8">
        <DashboardAnalytics 
           dataKehadiran={dataKehadiranChart} 
           dataGaji={dataGajiChart} 
        />
      </div>

      {/* 3. TABEL DAFTAR CUTI */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Daftar Cuti Aktif (Approved)</h3>
        </div>
        
        <div className="p-6">
          {activeLeaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider">
                    <th className="pb-4 font-semibold">Nama Pegawai</th>
                    <th className="pb-4 font-semibold">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeLeaves.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="py-4 text-slate-700 font-medium group-hover:text-blue-600 transition-colors">
                        {item.name || "User Tidak Dikenal"}
                      </td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                          {item.jenis_cuti}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm italic">Belum ada data cuti yang disetujui untuk hari ini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}