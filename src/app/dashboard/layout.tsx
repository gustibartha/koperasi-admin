import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar Kiri */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
        <div className="p-6">
          <h2 className="text-xl font-bold tracking-wider text-blue-400">ADMIN KOPERASI</h2>
          <p className="text-xs text-slate-400 mt-1">HR & Monitoring System</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
  <a href="/dashboard" className="flex items-center p-3 rounded-lg hover:bg-slate-800 transition-colors group">
    <span className="text-slate-300 group-hover:text-white">📊 Dashboard Utama</span>
  </a>
  <a href="/dashboard/pegawai" className="flex items-center p-3 rounded-lg hover:bg-slate-800 transition-colors group">
    <span className="text-slate-300 group-hover:text-white">👥 Data Pegawai</span>
  </a>
  <a href="/dashboard/payroll" className="flex items-center p-3 rounded-lg hover:bg-slate-800 transition-colors group">
    <span className="text-slate-300 group-hover:text-white">💰 Sistem Payroll</span>
  </a>
  <a href="/dashboard/cuti" className="flex items-center p-3 rounded-lg hover:bg-slate-800 transition-colors group">
    <span className="text-slate-300 group-hover:text-white">📑 Manajemen Cuti</span>
  </a>
  <a href="/dashboard/kinerja" className="flex items-center p-3 rounded-lg hover:bg-slate-800 transition-colors group">
    <span className="text-slate-300 group-hover:text-white">🏆 Manajemen Kinerja</span>
  </a>

</nav>

        <div className="p-4 border-t border-slate-800">
           <a href="/api/auth/sign-out" className="text-sm text-red-400 hover:text-red-300 px-3">🚪 Keluar Sistem</a>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}