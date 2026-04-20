import { db } from "@/db";
import { user, leaves } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// WAJIB ADA: Agar Vercel selalu mengambil data terbaru dari Turso
export const dynamic = 'force-dynamic';

export default async function ManajemenCutiPage() {
  let allLeaves: any[] = [];

  try {
    // Ambil SEMUA data cuti dan gabungkan dengan nama pegawainya
    // Diurutkan dari yang paling baru
    const result = await db
      .select({
        id: leaves.id,
        name: user.name,
        jenis_cuti: leaves.jenisCuti,
        status: leaves.status,
        tanggal_mulai: leaves.tanggalMulai,
        tanggal_selesai: leaves.tanggalSelesai,
        keterangan: leaves.keterangan,
      })
      .from(leaves)
      .leftJoin(user, eq(leaves.userId, user.id))
      .orderBy(desc(leaves.tanggalMulai));
      
    allLeaves = result;
  } catch (error) {
    console.error("Gagal mengambil data cuti:", error);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Cuti Pegawai</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Ajukan Cuti
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Semua Riwayat Cuti</h3>
        </div>
        
        <div className="p-6">
          {allLeaves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-4 font-semibold">Nama Pegawai</th>
                    <th className="pb-4 font-semibold">Jenis Cuti</th>
                    <th className="pb-4 font-semibold">Tanggal</th>
                    <th className="pb-4 font-semibold">Keterangan</th>
                    <th className="pb-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allLeaves.map((item, index) => (
                    <tr key={index} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 text-slate-700 font-medium">
                        {item.name || "User Dihapus"}
                      </td>
                      <td className="py-4 text-slate-600 text-sm">{item.jenis_cuti}</td>
                      <td className="py-4 text-slate-600 text-sm">
                        {item.tanggal_mulai ? new Date(item.tanggal_mulai).toLocaleDateString('id-ID') : '-'} 
                        <span className="mx-1">s/d</span> 
                        {item.tanggal_selesai ? new Date(item.tanggal_selesai).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="py-4 text-slate-500 text-sm max-w-xs truncate">
                        {item.keterangan || "-"}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                          item.status === 'REJECTED' ? 'bg-red-50 text-red-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm italic">Belum ada riwayat pengajuan cuti.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}