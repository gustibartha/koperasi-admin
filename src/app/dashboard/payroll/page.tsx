import { db } from "@/db";
import { user } from "@/db/schema";
import PrintSlipButton from "@/components/PrintSlipButton"; // Pastikan path folder benar

export const dynamic = 'force-dynamic';

export default async function PayrollPage() {
  let payrollData: any[] = [];

  try {
    // Ambil data gaji dari tabel user
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
        toko: user.toko,
        lainLain: user.lainLain,
      })
      .from(user);
      
    payrollData = result;
  } catch (error) {
    console.error("Gagal mengambil data payroll:", error);
  }

  // Fungsi format Rupiah
  const formatRupiah = (angka: number | null) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-slate-800">Sistem Payroll Koperasi</h1>
        <p className="text-sm text-slate-500">Klik ikon printer untuk cetak slip per pegawai</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 no-print">
          <h3 className="font-bold text-slate-800">Daftar Gaji Pegawai</h3>
        </div>
        
        <div className="p-6">
          {payrollData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-4 font-semibold">Pegawai</th>
                    <th className="pb-4 font-semibold">Gaji Pokok</th>
                    <th className="pb-4 font-semibold">Tunjangan</th>
                    <th className="pb-4 font-semibold">Potongan</th>
                    <th className="pb-4 font-semibold text-right">Gaji Bersih</th>
                    <th className="pb-4 font-semibold text-right no-print">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrollData.map((item, index) => {
                    // Logika Perhitungan
                    const totalTunjangan = (item.uangMakan || 0) + (item.lemburan || 0);
                    const totalPotongan = (item.jamsostek || 0) + (item.bpjsKesehatan || 0) + (item.pinjaman || 0) + (item.toko || 0) + (item.lainLain || 0);
                    const gajiBersih = (item.gajiPokok || 0) + totalTunjangan - totalPotongan;

                    return (
                      <tr key={index} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-4">
                          <p className="text-slate-700 font-bold">{item.name}</p>
                          <p className="text-slate-400 text-xs">{item.jabatan || 'Staff'}</p>
                        </td>
                        <td className="py-4 text-slate-600 text-sm">
                          {formatRupiah(item.gajiPokok)}
                        </td>
                        <td className="py-4 text-emerald-600 text-sm font-medium">
                          +{formatRupiah(totalTunjangan)}
                        </td>
                        <td className="py-4 text-rose-500 text-sm font-medium">
                          -{formatRupiah(totalPotongan)}
                        </td>
                        <td className="py-4 text-right">
                          <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-md font-bold text-sm border border-slate-200">
                            {formatRupiah(gajiBersih)}
                          </span>
                        </td>
                        <td className="py-4 text-right no-print">
                          {/* Tombol Cetak dari Komponen Anda */}
                          <PrintSlipButton />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-sm italic">Belum ada data pegawai.</p>
            </div>
          )}
        </div>
      </div>

      {/* CSS KHUSUS UNTUK CETAK */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Sembunyikan elemen yang tidak perlu dicetak */
          aside, nav, .no-print, button {
            display: none !important;
          }
          /* Atur layout agar rapi di kertas */
          body {
            background: white !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
          .bg-white {
            border: none !important;
            box-shadow: none !important;
          }
          table {
            width: 100% !important;
            border: 1px solid #e2e8f0 !important;
          }
          th, td {
            border: 1px solid #e2e8f0 !important;
            padding: 8px !important;
          }
        }
      `}} />
    </div>
  );
}