import { db } from '@/db';
import { user } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { desc } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import DownloadTemplate from '@/components/DownloadTemplate';

export default async function PegawaiPage() {
  const daftarPegawai = await db.select().from(user).orderBy(desc(user.createdAt));

  // ACTION: Tambah Manual
  async function tambahPegawai(formData: FormData) {
    'use server';
    await db.insert(user).values({
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      email: (formData.get('email') as string).toLowerCase(),
      jabatan: formData.get('jabatan') as string,
      bidang: formData.get('bidang') as string,
      gajiPokok: Number(formData.get('gaji') || 0),
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    revalidatePath('/dashboard/pegawai');
  }

  // ACTION: Upload Excel
  async function uploadExcel(formData: FormData) {
    'use server';
    const file = formData.get('file') as File;
    if (!file || file.size === 0) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as any[];

      for (const item of data) {
        if (item.Nama && item.Email) {
          await db.insert(user).values({
            id: crypto.randomUUID(),
            name: String(item.Nama),
            email: String(item.Email).toLowerCase(),
            jabatan: String(item.Jabatan || ""),
            bidang: String(item.Bidang || ""),
            gajiPokok: Number(item.Gaji_Pokok || 0),
            uangMakanSM: Number(item.Uang_Makan || 0),
            lemburan: Number(item.Lemburan || 0),
            jamsostek: Number(item.Jamsostek || 0),
            bpjsKesehatan: Number(item.BPJS || 0),
            simpanPinjam: Number(item.Simpin || 0),
            toko: Number(item.Toko || 0),
            lainLain: Number(item.Lain_Lain || 0),
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      revalidatePath('/dashboard/pegawai');
    } catch (e) { console.error(e); }
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">MANAJEMEN PEGAWAI</h1>
          <DownloadTemplate />
        </header>

        {/* Form Pendaftaran */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border mb-8">
          <h2 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">Input Pegawai Baru</h2>
          <form action={tambahPegawai} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input name="name" placeholder="Nama" className="border p-2.5 rounded-xl text-sm" required />
            <input name="email" type="email" placeholder="Email" className="border p-2.5 rounded-xl text-sm" required />
            <input name="jabatan" placeholder="Jabatan" className="border p-2.5 rounded-xl text-sm" />
            <input name="gaji" type="number" placeholder="Gaji Pokok" className="border p-2.5 rounded-xl text-sm" />
            <button type="submit" className="bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all">Simpan</button>
          </form>
        </div>

        {/* Upload Excel Section */}
        <div className="bg-slate-900 p-6 rounded-3xl text-white mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold">Impor Massal (Excel)</h3>
            <p className="text-slate-400 text-xs">Update gaji, BPJS, dan potongan lainnya sekaligus.</p>
          </div>
          <form action={uploadExcel} className="flex gap-2">
            <input type="file" name="file" accept=".xlsx" className="text-xs" required />
            <button type="submit" className="bg-blue-500 px-4 py-2 rounded-lg text-xs font-bold uppercase">Upload</button>
          </form>
        </div>

        {/* Tabel Data */}
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr className="text-[10px] font-black text-slate-400 uppercase">
                <th className="p-5">Profil Pegawai</th>
                <th className="p-5">Struktur</th>
                <th className="p-5 text-right">Gaji Pokok</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {daftarPegawai.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-all">
                  <td className="p-5">
                    <div className="font-bold text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.email}</div>
                  </td>
                  <td className="p-5 text-xs font-bold text-slate-600 uppercase">
                    {p.jabatan || '-'} | {p.bidang || '-'}
                  </td>
                  <td className="p-5 text-right font-black text-slate-900">
                    Rp {(p.gajiPokok || 0).toLocaleString()}
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