import { db } from "@/db";
import { user, performance } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export default async function KinerjaPage() {
  let allKinerja: any[] = [];

  try {
    const result = await db
      .select({
        id: performance.id,
        name: user.name,
        jabatan: user.jabatan,
        bulan: performance.bulan,
        nilai: performance.nilai,
        evaluasi: performance.evaluasi,
      })
      .from(performance)
      .leftJoin(user, eq(performance.userId, user.id))
      .orderBy(desc(performance.bulan));
      
    allKinerja = result;
  } catch (error) {
    console.error("Gagal mengambil data kinerja:", error);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Kinerja Pegawai</h1>
        <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Buat Evaluasi
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Daftar Evaluasi Bulanan</h3>
        </div>
        
        <div className="p-6">
          {allKinerja.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-4 font-semibold">Nama Pegawai</th>
                    <th className="pb-4 font-semibold">Bulan</th>
                    <th className="pb-4 font-semibold">Nilai (0-100)</th>
                    <th className="pb-4 font-semibold">Catatan Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allKinerja.map((item, index) => (
                    <tr key={index} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4">
                        <p className="text-slate-700 font-medium">{item.name || "Anonim"}</p>
                        <p className="text-slate-400 text-xs">{item.jabatan || "-"}</p>
                      </td>
                      <td className="py-4 text-slate-600 font-medium">{item.bulan}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${item.nilai >= 80 ? 'text-emerald-500' : item.nilai >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                            {item.nilai}
                          </span>
                          {/* Progress bar kecil */}
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.nilai >= 80 ? 'bg-emerald-500' : item.nilai >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                              style={{ width: `${item.nilai}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-slate-500 text-sm max-w-xs truncate">
                        {item.evaluasi || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm italic">Belum ada data evaluasi kinerja.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}