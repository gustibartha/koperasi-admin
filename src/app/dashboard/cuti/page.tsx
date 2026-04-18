import { db } from '@/db';
import { user, leaves } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export default async function LeavePage() {
  // Ambil data pengajuan cuti
  const dataCuti = await db
    .select({
      id: leaves.id,
      nama: user.name,
      jabatan: user.jabatan,
      jenis: leaves.jenisCuti,
      mulai: leaves.tanggalMulai,
      selesai: leaves.tanggalSelesai,
      status: leaves.status,
      alasan: leaves.alasan
    })
    .from(leaves)
    .leftJoin(user, eq(leaves.userId, user.id))
    .orderBy(desc(leaves.createdAt));

  // Action: Fungsi untuk Manajer menyetujui/menolak
  async function handleApproval(formData: FormData) {
    'use server';
    const id = Number(formData.get('id'));
    const tindakan = formData.get('tindakan') as string;

    await db.update(leaves)
      .set({ status: tindakan })
      .where(eq(leaves.id, id));

    revalidatePath('/dashboard/cuti');
    revalidatePath('/dashboard');
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">Leave Approval Panel</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Alur: Karyawan — Manajer</p>
        </header>

        <div className="grid gap-6">
          {dataCuti.map((c) => (
            <div key={c.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">{c.jenis}</span>
                  <span className={`text-[9px] font-black px-3 py-0.5 rounded-full ${c.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                    {c.status}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase leading-none">{c.nama}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{c.jabatan || 'Anggota Koperasi'}</p>
                <div className="mt-4 text-[11px] font-bold bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-6">
                  <div className="text-slate-500">DARI: <span className="text-slate-900 ml-1">{c.mulai?.toLocaleDateString('id-ID')}</span></div>
                  <div className="text-slate-500">S/D: <span className="text-slate-900 ml-1">{c.selesai?.toLocaleDateString('id-ID')}</span></div>
                </div>
              </div>

              {/* TOMBOL AKSI MANAJER */}
              <div className="flex gap-2">
                {c.status === 'PENDING' ? (
                  <form action={handleApproval} className="flex gap-2">
                    <input type="hidden" name="id" value={c.id} />
                    <button name="tindakan" value="REJECTED" className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase hover:bg-red-50 hover:text-red-600 transition-all">Tolak</button>
                    <button name="tindakan" value="APPROVED" className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-blue-600 transition-all">Setujui</button>
                  </form>
                ) : (
                  <div className="text-[10px] font-bold text-slate-300 italic uppercase">Sudah Diproses</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}