"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AjukanCutiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState({ text: "", type: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPesan({ text: "Sedang mengirim pengajuan...", type: "info" });

    // Ambil data dari form
    const formData = new FormData(e.currentTarget);
    const data = {
      userId: "bartha", // ID Pegawai
      jenisCuti: formData.get("jenis_cuti"),
      tanggalMulai: formData.get("tanggal_mulai"),
      tanggalSelesai: formData.get("tanggal_selesai"),
      keterangan: formData.get("keterangan"),
    };

    try {
      const response = await fetch("/api/cuti", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setPesan({ text: "✅ Berhasil! Mengalihkan ke halaman riwayat cuti...", type: "success" });
        // Tunggu 2 detik, lalu kembali ke halaman riwayat cuti
        setTimeout(() => {
          router.push("/dashboard/cuti"); 
          router.refresh();
        }, 2000);
      } else {
        setPesan({ text: "❌ Gagal mengajukan cuti.", type: "error" });
        setLoading(false);
      }
    } catch (error) {
      setPesan({ text: "❌ Terjadi kesalahan jaringan.", type: "error" });
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/cuti" className="text-slate-400 hover:text-slate-600 transition-colors">
          ← Kembali
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Form Pengajuan Cuti</h1>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Jenis Cuti</label>
            <select name="jenis_cuti" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
              <option value="">-- Pilih Jenis Cuti --</option>
              <option value="TAHUNAN">Cuti Tahunan</option>
              <option value="SAKIT">Cuti Sakit</option>
              <option value="PENTING">Cuti Alasan Penting</option>
              <option value="MELAHIRKAN">Cuti Melahirkan</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Mulai</label>
              <input type="date" name="tanggal_mulai" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Selesai</label>
              <input type="date" name="tanggal_selesai" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Alasan / Keterangan</label>
            <textarea name="keterangan" rows={3} required placeholder="Jelaskan alasan cuti Anda di sini..." className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
          </div>

          {pesan.text && (
            <div className={`p-4 rounded-lg text-sm font-medium ${pesan.type === 'success' ? 'bg-emerald-50 text-emerald-700' : pesan.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'}`}>
              {pesan.text}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 shadow-lg shadow-blue-200'}`}
          >
            {loading ? "Menyimpan Data..." : "Kirim Pengajuan Cuti"}
          </button>
        </form>
      </div>
    </div>
  );
}