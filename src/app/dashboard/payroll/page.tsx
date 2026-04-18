import { db } from '@/db';
import { user, attendances, leaves, performance } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import PrintSlipButton from '@/components/PrintSlipButton';

export default async function PayrollPage() {
  // 1. Query Super Terintegrasi: Gabungkan 4 Tabel (User, Absen, Cuti, Kinerja)
  const payrollData = await db
    .select({
      id: user.id,
      name: user.name,
      jabatan: user.jabatan,
      gajiPokok: user.gajiPokok,
      uangMakan: user.uangMakanSM,
      lemburan: user.lemburan,
      jamsostek: user.jamsostek,
      bpjs: user.bpjsKesehatan,
      simpin: user.simpanPinjam,
      toko: user.toko,
      lainLain: user.lainLain,
      // Hitung Absen Luar Radius (Denda 50rb/absen)
      absenInvalid: sql<number>`SUM(CASE WHEN ${attendances.isValid} = 0 THEN 1 ELSE 0 END)`,
      // Hitung Total Hari Cuti yang di-Approved
      totalCuti: sql<number>`SUM(CASE WHEN ${leaves.status} = 'APPROVED' THEN 1 ELSE 0 END)`,
      // Ambil Total Bonus dari Manajemen Kinerja
      totalBonus: sql<number>`SUM(${performance.bonusInsentif})`,
    })
    .from(user)
    .leftJoin(attendances, eq(user.id, attendances.userId))
    .leftJoin(leaves, eq(user.id, leaves.userId))
    .leftJoin(performance, eq(user.id, performance.userId))
    .groupBy(user.id);

  const f = (n: number) => new Intl.NumberFormat('id-ID').format(n || 0);

  return (
    <div className="p-4 bg-slate-100 min-h-screen font-sans text-slate-900">
      <div className="max-w-7xl mx-auto mb-6 print:hidden">
        <h1 className="text-3xl font-black italic tracking-tighter text-slate-900 uppercase">
          Final Payroll System
        </h1>
        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">
          Integrasi: Geofencing • Leaves • Performance Bonus
        </p>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
        {/* KOP SLIP GAJI - HANYA MUNCUL SAAT PRINT */}
        <div className="hidden print:block p-10 border-b-8 border-double border-slate-900 text-center bg-slate-50">
          <h1 className="text-3xl font-black uppercase tracking-tighter">Slip Gaji Karyawan Koperasi</h1>
          <p className="text-xs font-bold uppercase tracking-[0.3em] mt-2">Laporan Penggajian & Kinerja Terpadu</p>
          <div className="mt-4 text-[10px] font-mono">ID Dokumen: PAY-{new Date().getTime()}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[10px] border-collapse border border-slate-300">
            <thead className="bg-slate-900 text-white text-center">
              <tr className="print:bg-white print:text-black">
                <th rowSpan={2} className="border border-slate-300 p-3">NAMA & JABATAN</th>
                <th colSpan={2} className="border border-slate-300 p-1 bg-amber-600 print:text-black">ABSENSI & CUTI</th>
                <th rowSpan={2} className="border border-slate-300 p-2 bg-blue-700 print:text-black font-black">GAPOK (BERSIH)</th>
                <th colSpan={3} className="border border-slate-300 p-1 bg-emerald-700 print:text-black">TUNJANGAN & BONUS</th>
                <th colSpan={5} className="border border-slate-300 p-1 bg-red-600 print:text-black">POTONGAN KOPERASI</th>
                <th rowSpan={2} className="border border-slate-300 p-3 bg-slate-950 text-white print:text-black text-xs font-black">TAKE HOME PAY</th>
                <th rowSpan={2} className="border border-slate-300 p-2 print:hidden">PRINT</th>
              </tr>
              <tr className="text-[9px]">
                <th className="border border-slate-300 p-1 bg-amber-500 print:text-black">OUT RAD</th>
                <th className="border border-slate-300 p-1 bg-amber-500 print:text-black">CUTI</th>
                <th className="border border-slate-300 p-1 bg-emerald-600 print:text-black">MAKAN</th>
                <th className="border border-slate-300 p-1 bg-emerald-600 print:text-black">LEMBUR</th>
                <th className="border border-slate-300 p-1 bg-emerald-600 print:text-black font-black">BONUS KPI</th>
                <th className="border border-slate-300 p-1 bg-red-500 print:text-black">JAM</th>
                <th className="border border-slate-300 p-1 bg-red-500 print:text-black">BPJS</th>
                <th className="border border-slate-300 p-1 bg-red-500 print:text-black">SP</th>
                <th className="border border-slate-300 p-1 bg-red-500 print:text-black">TOKO</th>
                <th className="border border-slate-300 p-1 bg-red-500 print:text-black">LAIN</th>
              </tr>
            </thead>
            <tbody>
              {payrollData.map((p) => {
                const potAbsen = (p.absenInvalid || 0) * 50000;
                const gajiBersih = (p.gajiPokok || 0) - potAbsen;
                const totalPotLain = (p.jamsostek || 0) + (p.bpjs || 0) + (p.simpin || 0) + (p.toko || 0) + (p.lainLain || 0);
                
                // KALKULASI AKHIR TERMASUK BONUS KPI
                const totalDiterima = gajiBersih + (p.uangMakan || 0) + (p.lemburan || 0) + (p.totalBonus || 0) - totalPotLain;

                return (
                  <tr key={p.id} className="text-center hover:bg-slate-50 transition-colors group">
                    <td className="border border-slate-300 p-3 text-left">
                       <div className="font-black text-slate-800 uppercase text-[11px]">{p.name}</div>
                       <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{p.jabatan}</div>
                    </td>
                    <td className="border border-slate-300 p-2 font-bold text-red-600">{f(potAbsen)}</td>
                    <td className="border border-slate-300 p-2 font-black text-amber-600">{p.totalCuti || 0} H</td>
                    <td className="border border-slate-300 p-2 bg-blue-50/50 font-black text-blue-800">{f(gajiBersih)}</td>
                    
                    <td className="border border-slate-300 p-2">{f(p.uangMakan || 0)}</td>
                    <td className="border border-slate-300 p-2 text-blue-600 font-bold">{f(p.lemburan || 0)}</td>
                    <td className="border border-slate-300 p-2 bg-emerald-50 font-black text-emerald-700">{f(p.totalBonus || 0)}</td>
                    
                    <td className="border border-slate-300 p-2">{f(p.jamsostek || 0)}</td>
                    <td className="border border-slate-300 p-2">{f(p.bpjs || 0)}</td>
                    <td className="border border-slate-300 p-2">{f(p.simpin || 0)}</td>
                    <td className="border border-slate-300 p-2">{f(p.toko || 0)}</td>
                    <td className="border border-slate-300 p-2">{f(p.lainLain || 0)}</td>
                    
                    <td className="border border-slate-300 p-3 bg-slate-900 text-white font-black text-[12px] group-hover:bg-blue-600 transition-all">
                      Rp {f(totalDiterima)}
                    </td>
                    <td className="border border-slate-300 p-2 print:hidden">
                      <PrintSlipButton />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER - Hidden saat print */}
      <div className="max-w-7xl mx-auto mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="bg-emerald-600 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-100">
           <h4 className="font-black text-xs uppercase tracking-widest mb-2 italic">Performance Sync</h4>
           <p className="text-[10px] leading-relaxed opacity-90 text-justify">
             Data <strong>Bonus KPI</strong> ditarik otomatis dari Manajemen Kinerja. Setiap apresiasi kinerja yang diberikan HR akan langsung menambah Take Home Pay pegawai.
           </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-center">
           <div className="text-[10px] font-bold text-slate-400 italic">
             "Gunakan mode Landscape saat mencetak slip gaji <br/> untuk hasil visual terbaik."
           </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: landscape; margin: 0.5cm; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          table { width: 100% !important; border: 1px solid black !important; border-collapse: collapse !important; }
          th, td { border: 1px solid black !important; padding: 4px !important; color: black !important; }
          th { background-color: #f8fafc !important; font-weight: bold !important; }
          .bg-slate-900 { background: white !important; color: black !important; font-size: 14pt !important; }
        }
      `}</style>
    </div>
  );
}