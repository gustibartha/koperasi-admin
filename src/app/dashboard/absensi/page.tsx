"use client";

import { useState } from "react";

export default function AbsensiPage() {
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState({ text: "", type: "" }); // type: 'success' | 'error' | 'info'

  // Fungsi untuk menangani klik tombol absen
  const handleAbsen = async (jenis: "Masuk" | "Pulang") => {
    setLoading(true);
    setPesan({ text: "Sedang mencari lokasi GPS Anda...", type: "info" });

    // Cek apakah browser mendukung GPS
    if (!navigator.geolocation) {
      setPesan({ text: "Browser Anda tidak mendukung fitur GPS.", type: "error" });
      setLoading(false);
      return;
    }

    // Minta lokasi pengguna
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setPesan({ text: `Lokasi ditemukan. Mengirim data Absen ${jenis}...`, type: "info" });

        try {
          // Mengirim data ke API Route yang sudah kita perbaiki tadi
          const response = await fetch("/api/attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: "bartha", // CATATAN: Sementara kita pakai ID Pak Bartha agar langsung jalan
              jenis: jenis,
              lat: latitude,
              long: longitude,
            }),
          });

          if (response.ok) {
            setPesan({ text: `✅ Berhasil Absen ${jenis} pada ${new Date().toLocaleTimeString('id-ID')}`, type: "success" });
          } else {
            setPesan({ text: "❌ Gagal menyimpan data absensi ke database.", type: "error" });
          }
        } catch (error) {
          setPesan({ text: "❌ Terjadi kesalahan jaringan.", type: "error" });
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setPesan({ text: "❌ Gagal mendapat lokasi. Pastikan izin GPS (Location) diaktifkan di browser.", type: "error" });
        setLoading(false);
      },
      { enableHighAccuracy: true } // Minta akurasi tinggi
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Sistem Absensi Kehadiran</h1>
        <p className="text-slate-500 mt-2">Pastikan Anda berada di area kantor saat melakukan absensi.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="text-4xl font-mono font-bold text-indigo-600 mb-8">
          {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button 
            onClick={() => handleAbsen("Masuk")}
            disabled={loading}
            className={`px-8 py-4 rounded-xl text-lg font-bold text-white transition-all ${
              loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-1 shadow-lg shadow-emerald-200'
            }`}
          >
            👋 Absen Masuk
          </button>
          
          <button 
            onClick={() => handleAbsen("Pulang")}
            disabled={loading}
            className={`px-8 py-4 rounded-xl text-lg font-bold text-white transition-all ${
              loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-rose-500 hover:bg-rose-600 hover:-translate-y-1 shadow-lg shadow-rose-200'
            }`}
          >
            🏠 Absen Pulang
          </button>
        </div>

        {/* Kotak Pesan Notifikasi */}
        {pesan.text && (
          <div className={`p-4 rounded-lg text-sm font-medium animate-pulse ${
            pesan.type === 'success' ? 'bg-emerald-50 text-emerald-700' :
            pesan.type === 'error' ? 'bg-rose-50 text-rose-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {pesan.text}
          </div>
        )}
      </div>
    </div>
  );
}