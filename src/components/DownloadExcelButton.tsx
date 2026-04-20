"use client";

import React from 'react';
import * as XLSX from 'xlsx';

interface DownloadProps {
  data: any[];
  namaBulan: string;
  daysInMonth: number;
}

export default function DownloadExcelButton({ data, namaBulan, daysInMonth }: DownloadProps) {
  const downloadExcel = () => {
    // 1. Siapkan Header (Nama + Tanggal 1 s/d N + Total)
    const header = ["Nama Karyawan", ...Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()), "H", "I", "S", "C", "A"];

    // 2. Transformasi Data Rekap ke Format Baris Excel
    const rows = data.map(p => {
      const rowData: any = [p.name];
      // Isi kehadiran per hari
      for (let d = 1; d <= daysInMonth; d++) {
        rowData.push(p.harian[d] || "-");
      }
      // Isi Summary
      rowData.push(p.stats.HADIR, p.stats.IZIN, p.stats.SAKIT, p.stats.CUTI, p.stats.ALPA);
      return rowData;
    });

    // 3. Gabungkan Header dan Baris
    const worksheetData = [header, ...rows];

    // 4. Proses Excel
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Absensi");

    // 5. Trigger Download
    XLSX.writeFile(wb, `Rekap_Absensi_${namaBulan.replace(" ", "_")}.xlsx`);
  };

  return (
    <button
      onClick={downloadExcel}
      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-200"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      Unduh Excel
    </button>
  );
}