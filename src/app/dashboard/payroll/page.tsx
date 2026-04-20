import { db } from "@/db";
import { user } from "@/db/schema";

export const dynamic = 'force-dynamic';

export default async function PayrollPage() {
  let payrollData: any[] = [];

  try {
    // Mengambil data pegawai beserta komponen gajinya
    const result = await db
      .select({
        id: user.id,
        name: user.name,
        jabatan: user.jabatan,
        gajiPokok: user.gajiPokok,
        uangMakan: user.uangMakanSM,
        lemburan: user.lemburan,
        jamsostek: user.jamsostek,
        bpjsKesehatan: user.bpjsKesehatan,
        pinjaman: user.simpanPinjam,
      })
      .from(user);
      
    payrollData = result;
  } catch (error) {
    console.error("Gagal mengambil data payroll:", error);
  }

  // Fungsi pintar untuk mengubah angka menjadi format Rupiah (Rp)
  const formatRupiah = (angka: number | null) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Sistem Payroll Koperasi</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Cetak Slip Gaji
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Rincian Gaji Bulan Ini</h3>
        </div>
        
        <div className="p-6">
          {payrollData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-4 font-semibold">Nama Pegawai</th>
                    <th className="pb-4 font-semibold">Pendapatan</th>
                    <th className="pb-4 font-semibold">Potongan (BPJS/Pinjaman)</th>
                    <th className="pb-4 font-semibold text-right">Total Gaji Bersih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollData.map((item, index) => {
                    // Hitung-hitungan otomatis
                    const totalPendapatan = (item.gajiPokok || 0) + (item.uangMakan || 0) + (item.lemburan || 0);
                    const totalPotongan = (item.jamsostek || 0) + (item.bpjsKesehatan || 0) + (item.pinjaman || 0);
                    const gajiBersih = totalPendapatan - totalPotongan;

                    return (
                      <tr key={index} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4">
                          <p className="text-slate-700 font-medium">{item.name || "Anonim"}</p>
                          <p className="text-slate-400 text-xs">{item.jabatan || "-"}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-emerald-600 text-sm font-medium">+{formatRupiah(totalPendapatan)}</p>
                        </td>
                        <td className="py-4">
                          <p className="text-red-500 text-sm font-medium">-{formatRupiah(totalPotongan)}</p>
                        </td>
                        <td className="py-4 text-right">
                          <span className="bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg font-bold">
                            {formatRupiah(gajiBersih)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm italic">Belum ada data pegawai untuk dihitung gajinya.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}