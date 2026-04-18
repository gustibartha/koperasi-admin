import { db } from '@/db';
import { user, performance } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export default async function PerformancePage() {
  const daftarPegawai = await db.select().from(user);
  const dataKinerja = await db
    .select({
      id: performance.id,
      nama: user.name,
      periode: performance.periode,
      skor: performance.nilaiKinerja,
      bonus: performance.bonusInsentif,
      catatan: performance.catatan
    })
    .from(performance)
    .leftJoin(user, eq(performance.userId, user.id))
    .orderBy(desc(performance.createdAt));

  async function tambahNilai(formData: FormData) {
    'use server';
    await db.insert(performance).values({
      userId: formData.get('userId') as string,
      periode: formData.get('periode') as string,
      nilaiKinerja: Number(formData.get('skor')),
      bonusInsentif: Number(formData.get('bonus')),
      catatan: formData.get('catatan') as string,
      createdAt: new Date(),
    });
    revalidatePath('/dashboard/kinerja');
    revalidatePath('/dashboard/payroll');
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Performance Management</h1>
          <p className="text-slate-500 text-sm font-medium">Penilaian KPI & Pemberian Insentif Pegawai.</p>
        </header>

        {/* FORM INPUT NILAI */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 mb-8">
          <h2 className="text-xs font-black text-blue-600 uppercase mb-4 tracking-[0.2em]">Input Penilaian Kinerja</h2>
          <form action={tambahNilai} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <select name="userId" className="border p-3 rounded-2xl text-xs font-bold" required>
              <option value="">Pilih Pegawai</option>
              {daftarPegawai.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input name="periode" placeholder="Periode (Jan 2026)" className="border p-3 rounded-2xl text-xs font-bold" required />
            <input name="skor" type="number" placeholder="Skor KPI (1-100)" className="border p-3 rounded-2xl text-xs font-bold" required />
            <input name="bonus" type="number" placeholder="Bonus Insentif (Rp)" className="border p-3 rounded-2xl text-xs font-bold" required />
            <button type="submit" className="bg-slate-900 text-white font-black rounded-2xl text-[10px] uppercase hover:bg-emerald-600 transition-all">Simpan Nilai</button>
            <textarea name="catatan" placeholder="Catatan Evaluasi" className="border p-3 rounded-2xl text-xs md:col-span-5 h-20" />
          </form>
        </div>

        {/* TABEL RANKING KINERJA */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase">
              <tr>
                <th className="p-5">Pegawai & Periode</th>
                <th className="p-5 text-center">Skor KPI</th>
                <th className="p-5 text-center">Bonus Insentif</th>
                <th className="p-5">Catatan HR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataKinerja.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50 transition-all">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 text-xs uppercase">{k.nama}</div>
                    <div className="text-[10px] text-slate-400 font-bold">{k.periode}</div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={`px-4 py-1 rounded-full text-xs font-black ${
                      Number(k.skor) >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {k.skor}
                    </span>
                  </td>
                  <td className="p-5 text-center font-bold text-slate-600 text-xs">
                    Rp {(k.bonus || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="p-5 text-[10px] text-slate-500 italic max-w-xs truncate">
                    "{k.catatan || '-'}"
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