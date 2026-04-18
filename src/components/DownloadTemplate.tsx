"use client";
import * as XLSX from 'xlsx';

export default function DownloadTemplate() {
  const handleDownload = () => {
    const template = [{
      Nama: "Budi Santoso",
      Email: "budi@koperasi.com",
      Jabatan: "Staff",
      Bidang: "IT",
      Gaji_Pokok: 5000000,
      Uang_Makan: 500000,
      Lemburan: 200000,
      Jamsostek: 20000,
      BPJS: 50000,
      Simpin: 100000,
      Toko: 0,
      Lain_Lain: 0
    }];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DataPegawai");
    XLSX.writeFile(wb, "Template_Pegawai_Koperasi.xlsx");
  };

  return (
    <button onClick={handleDownload} type="button" className="text-xs font-bold text-blue-400 underline hover:text-blue-300">
      📥 Download Template Excel
    </button>
  );
}