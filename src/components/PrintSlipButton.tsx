"use client"; // Wajib agar onClick bisa jalan

export default function PrintSlipButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-slate-100 hover:bg-blue-600 hover:text-white p-2 rounded-lg transition-all print:hidden"
      title="Print Slip Gaji"
    >
      🖨️
    </button>
  );
}