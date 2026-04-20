"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TambahEvaluasi() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    await fetch("/api/performance", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(formData)),
    });

    router.push("/dashboard/kinerja");
    router.refresh();
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Input Evaluasi Kinerja</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">ID Pegawai</label>
          <input name="userId" defaultValue="bartha" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Periode Bulan</label>
          <input name="bulan" placeholder="Contoh: April 2026" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nilai (0-100)</label>
          <input name="nilai" type="number" min="0" max="100" className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Catatan Evaluasi</label>
          <textarea name="evaluasi" className="w-full p-2 border rounded" rows={3}></textarea>
        </div>
        <button disabled={loading} className="w-full bg-amber-500 text-white py-2 rounded font-bold">
          {loading ? "Menyimpan..." : "Simpan Evaluasi"}
        </button>
      </form>
    </div>
  );
}