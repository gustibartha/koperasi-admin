import { db } from "@/db";
import { user, attendances, leaves } from "@/db/schema";
import { and, gte, lte, eq } from "drizzle-orm";
import DownloadExcelButton from "@/components/DownloadExcelButton"; // <-- Import tombol Excel di sini

export const dynamic = 'force-dynamic';

export default async function RekapAbsensiPage() {
  // 1. Inisialisasi Waktu
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed (April = 3)

  // Mencari tanggal pertama dan terakhir bulan ini
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Array angka 1 sampai 28/30/31 untuk header tabel
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  let dataRekap: any[] = [];

  try {
    // 2. Ambil Data Dasar dari Turso
    const allUsers = await db.select({ id: user.id, name: user.name }).from(user);

    // Ambil absensi bulan ini
    const attendancesData = await db
      .select()
      .from(attendances)
      .where(
        and(
          gte(attendances.tanggal, firstDayOfMonth),
          lte(attendances.tanggal, lastDayOfMonth)
        )
      );

    // Ambil cuti yang sudah disetujui bulan ini
    const approvedLeaves = await db
      .select()
      .from(leaves)
      .where(
        and(
          eq(leaves.status, "APPROVED"),
          // Logika: Cuti beririsan dengan bulan ini
          lte(leaves.tanggalMulai, lastDayOfMonth),
          gte(leaves.tanggalSelesai, firstDayOfMonth)
        )
      );

    // 3. Proses Mapping Data (Pivot)
    dataRekap = allUsers.map((pegawai) => {
      const rekapHarian: Record<number, string> = {};
      const stats = { HADIR: 0, IZIN: 0, SAKIT: 0, ALPA: 0, CUTI: 0 };

      // A. Cek data dari tabel attendances
      attendancesData
        .filter((a) => a.userId === pegawai.id)
        .forEach((record) => {
          const tgl = new Date(record.tanggal).getDate();
          const status = record.statusHadir.toUpperCase(); // HADIR, IZIN, SAKIT, ALPA
          
          let kode = '-';
          if (status === 'HADIR') { kode = 'H'; stats.HADIR++; }
          else if (status === 'IZIN') { kode = 'I'; stats.IZIN++; }
          else if (status === 'SAKIT') { kode = 'S'; stats.SAKIT++; }
          else if (status === 'ALPA') { kode = 'A'; stats.ALPA++; }
          
          rekapHarian[tgl] = kode;
        });

      // B. Cek data dari tabel leaves (Overide jika ada cuti)
      approvedLeaves
        .filter((l) => l.userId === pegawai.id)
        .forEach((leave) => {
          const mulai = new Date(leave.tanggalMulai);
          const selesai = new Date(leave.tanggalSelesai);

          // Tandai tanggal di rekap yang masuk rentang cuti
          for (let d = 1; d <= daysInMonth; d++) {
            const checkDate = new Date(year, month, d);
            if (checkDate >= mulai && checkDate <= selesai) {
              // Jika belum ada status hadir (atau ingin cuti menang), tulis 'C'
              if (!rekapHarian[d] || rekapHarian[d] === '-') {
                rekapHarian[d] = 'C';
                stats.CUTI++;
              }
            }
          }
        });

      return {
        id: pegawai.id,
        name: pegawai.name,
        harian: rekapHarian,
        stats
      };
    });

  } catch (error) {
    console.error("Gagal memuat rekap:", error);
  }

  const namaBulanStr = today.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Rekap Absensi Karyawan</h1>
          <p className="text-slate-500 font-medium">Periode Laporan: <span className="text-blue-600">{namaBulanStr}</span></p>
        </div>
        
        {/* Wrapper flex untuk menggabungkan Legend dan Tombol Excel */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Legend / Keterangan */}
          <div className="flex flex-wrap gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-200">
             <Badge label="H" desc="Hadir" color="bg-emerald-100 text-emerald-700" />
             <Badge label="I" desc="Izin" color="bg-blue-100 text-blue-700" />
             <Badge label="S" desc="Sakit" color="bg-orange-100 text-orange-700" />
             <Badge label="C" desc="Cuti" color="bg-purple-100 text-purple-700" />
             <Badge label="A" desc="Alpa" color="bg-red-100 text-red-700" />
          </div>

          {/* Tombol Download Excel */}
          <DownloadExcelButton 
            data={dataRekap} 
            namaBulan={namaBulanStr} 
            daysInMonth={daysInMonth} 
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="p-5 font-bold text-slate-700 whitespace-nowrap sticky left-0 bg-slate-50 z-20 border-r border-slate-200 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                  Nama Karyawan
                </th>
                {daysArray.map(day => (
                  <th key={day} className="p-3 text-center font-bold text-slate-400 text-xs min-w-[45px] border-r border-slate-100">
                    {String(day).padStart(2, '0')}
                  </th>
                ))}
                <th className="p-3 text-center font-bold text-slate-700 bg-slate-100/50 border-l border-slate-200">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataRekap.map((pegawai) => (
                <tr key={pegawai.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="p-5 font-semibold text-slate-800 whitespace-nowrap sticky left-0 bg-white group-hover:bg-blue-50/50 z-10 border-r border-slate-200 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.1)]">
                    {pegawai.name}
                  </td>

                  {daysArray.map(day => {
                    const kode = pegawai.harian[day] || '-';
                    return (
                      <td key={day} className="p-3 text-center border-r border-slate-100">
                        <span className={`inline-block w-7 h-7 leading-7 rounded-lg text-xs font-bold transition-transform group-hover:scale-110
                          ${kode === 'H' ? 'bg-emerald-50 text-emerald-600' : 
                            kode === 'I' ? 'bg-blue-50 text-blue-600' :
                            kode === 'S' ? 'bg-orange-50 text-orange-600' :
                            kode === 'C' ? 'bg-purple-50 text-purple-600' :
                            kode === 'A' ? 'bg-red-50 text-red-600' : 'text-slate-200'}`}
                        >
                          {kode}
                        </span>
                      </td>
                    );
                  })}

                  <td className="p-3 bg-slate-50/50 border-l border-slate-200">
                    <div className="flex flex-col gap-1 text-[10px] font-bold">
                       <span className="text-emerald-600">H:{pegawai.stats.HADIR}</span>
                       <span className="text-red-500">A:{pegawai.stats.ALPA}</span>
                    </div>
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

// Komponen Kecil untuk Badge Legend
function Badge({ label, desc, color }: { label: string, desc: string, color: string }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <span className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold ${color}`}>{label}</span>
      <span className="text-xs text-slate-600 font-medium">{desc}</span>
    </div>
  )
}