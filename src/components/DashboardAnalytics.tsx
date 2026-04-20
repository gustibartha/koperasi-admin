"use client";

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

// Deklarasi tipe data untuk props TypeScript
interface AnalyticsProps {
  dataGaji: { bulan: string; totalGaji: number }[];
  dataKehadiran: { name: string; value: number }[];
}

export default function DashboardAnalytics({ dataGaji, dataKehadiran }: AnalyticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Grafik Total Gaji Karyawan */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4 text-slate-800">Tren Pengeluaran Gaji</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={dataGaji} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
              <YAxis 
                tickFormatter={(value) => `${value/1000000}jt`} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b' }} 
              />
              <Tooltip 
                formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`} 
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="totalGaji" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Gaji" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grafik Kehadiran & Cuti */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4 text-slate-800">Status Pegawai Hari Ini</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={dataKehadiran}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {dataKehadiran?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} Orang`, 'Jumlah']} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}