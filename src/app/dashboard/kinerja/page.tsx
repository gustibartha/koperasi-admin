import { db } from "@/db";
import { user, performance } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

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
        {/* Tombol ini bisa kita hidupkan nanti dengan form evaluasi */}
        <Link href="/dashboard/kinerja/tambah" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + Buat Evaluasi
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          {allKinerja.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-4 font-semibold">Pegawai</th>
                    <th className="pb-4 font-semibold">Periode</th>
                    <th className="pb-4 font-semibold">Nilai</th>
                    <th className="pb-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allKinerja.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-medium text-slate-700">{item.name}</td>
                      <td className="py-4 text-slate-600">{item.bulan}</td>
                      <td className="py-4">
                        <span className={`font-bold ${item.nilai >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.nilai}/100
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button className="text-blue-600 hover:underline text-sm">Detail</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 italic">
              Belum ada data evaluasi kinerja.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}