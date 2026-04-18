import { db } from '@/db';
import { user, attendances, leaves } from '@/db/schema';
import { desc, eq, sql, and, gte, lte } from 'drizzle-orm';
import AttendanceChart from '@/components/AttendanceChart';

export default async function DashboardPage() {
  // Ambil waktu awal hari ini (00:00:00) dan akhir hari ini (23:59:59)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // 1. Query Cuti Aktif Hari Ini (Ditingkatkan)
  // Menampilkan pegawai jika hari ini berada di antara tanggal mulai dan tanggal selesai
  const cutiHariIni = await db
    .select({ 
      nama: user.name, 
      jenis: leaves.jenisCuti,
      mulai: leaves.tanggalMulai,
      selesai: leaves.tanggalSelesai 
    })
    .from(leaves)
    .leftJoin(user, eq(leaves.userId, user.id))
    .where(
      and(
        eq(leaves.status, 'APPROVED'),
        lte(leaves.tanggalMulai, endOfToday), // Cuti sudah dimulai atau mulai hari ini
        gte(leaves.tanggalSelesai, startOfToday) // Cuti belum berakhir
      )
    );

  // 2. Data Absensi Terkini
  const dataAbsen = await db
    .select({ 
      id: attendances.id, 
      nama: user.name, 
      waktu: attendances.checkIn, 
      valid: attendances.isValid 
    })
    .from(attendances)
    .leftJoin(user, eq(attendances.userId, user.id))
    .orderBy(desc(attendances.checkIn))
    .limit(5);

  // 3. Statistik Chart
  const stats = await db
    .select({ status: attendances.isValid, count: sql<number>`count(*)` })
    .from(attendances)
    .groupBy(attendances.isValid);

  const chartData = stats.map(s => ({
    name: s.status ? 'Dalam Radius' : 'Luar Radius',
    value: s.count,
    color: s.status ? '#22c55e' : '#ef4444'
  }));

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">MONITORING OPERASIONAL</h1>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Koperasi Unit SDM • {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart Geofencing */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 h-[450px]">
          <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Statistik Radius Absensi
          </h3>
          <AttendanceChart chartData={chartData} />
        </div>

        {/* Panel Cuti Hari Ini */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-[450px]">
          <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
            <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
            Sedang Cuti / Sakit
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {cutiHariIni.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">Semua pegawai bertugas hari ini</p>
              </div>
            ) : (
              cutiHariIni.map((c, i) => (
                <div key={i} className="group bg-slate-50 hover:bg-amber-50 p-4 rounded-2xl border border-slate-100 hover:border-amber-200 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-black text-slate-700 uppercase">{c.nama}</span>
                    <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded-lg font-black uppercase shadow-sm">{c.jenis}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    Hingga: {c.selesai?.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tabel Aktivitas */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
          Log Absensi Terakhir
        </h3>
        <div className="overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <th className="pb-4">Pegawai</th>
                <th className="pb-4">Waktu Check-In</th>
                <th className="pb-4 text-right">Status Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {dataAbsen.map((a) => (
                <tr key={a.id} className="group">
                  <td className="py-5 font-bold text-slate-700 uppercase text-xs">{a.nama}</td>
                  <td className="py-5 text-slate-500 text-xs font-medium">{a.waktu?.toLocaleTimeString('id-ID')}</td>
                  <td className="py-5 text-right">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black tracking-widest ${a.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {a.valid ? 'DALAM RADIUS' : 'LUAR RADIUS'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}