'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';
import { DailyTrendChart, StackedCompositionChart } from '@/components/Charts';
import { InputerResponse } from '@/lib/types';
import { formatBulanIndo, getDaysInMonth } from '@/lib/utils';
import { Users, Calendar, TableProperties, BarChart3, Award, Trophy } from 'lucide-react';

export default function InputerPage() {
  const now = new Date();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = now.getFullYear().toString();

  const [bulan, setBulan] = useState(currentMonth);
  const [tahun, setTahun] = useState(currentYear);
  const [data, setData] = useState<InputerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matrix' | 'matrix_bulanan' | 'pivot' | 'grafik'>('matrix');

  const daysInMonth = getDaysInMonth(parseInt(bulan, 10), parseInt(tahun, 10));

  const fetchData = async (m = bulan, y = tahun) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inputer?bulan=${m}&tahun=${y}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch inputer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(bulan, tahun);
  }, [bulan, tahun]);

  const getAchColorClass = (ach: number) => {
    if (ach >= 80) return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    if (ach >= 50) return 'text-amber-700 bg-amber-100 border-amber-200';
    return 'text-rose-700 bg-rose-100 border-rose-200';
  };

  // Chart preparation
  const chartLabelsHarian = data?.harian.map((row) => row.periode.substring(0, 2)) || [];
  const chartValsHarian = data?.harian.map((row) => row.c_total) || [];

  const chartLabelsBulanan = data?.bulanan.map((row) => formatBulanIndo(row.periode)) || [];
  const chartDatasetsBulanan = [
    { label: 'Magfirah', data: data?.bulanan.map((r) => r.c_magfirah || 0) || [], backgroundColor: '#6366f1' },
    { label: 'Novita', data: data?.bulanan.map((r) => r.c_novita || 0) || [], backgroundColor: '#ec4899' },
    { label: 'Nigel', data: data?.bulanan.map((r) => r.c_nigel || 0) || [], backgroundColor: '#3b82f6' },
    { label: 'Gita', data: data?.bulanan.map((r) => r.c_gita || 0) || [], backgroundColor: '#10b981' },
    { label: 'Wawan', data: data?.bulanan.map((r) => r.c_wawan || 0) || [], backgroundColor: '#f59e0b' },
    { label: 'Lila', data: data?.bulanan.map((r) => r.c_lila || 0) || [], backgroundColor: '#8b5cf6' },
    { label: 'Yuni', data: data?.bulanan.map((r) => r.c_yuni || 0) || [], backgroundColor: '#14b8a6' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans text-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Order Processing Team</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Data <span className="text-red-600">Inputer</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Pantau performa harian, bulanan, dan matriks pencapaian petugas inputer Witel Sulbagteng.
          </p>
        </div>

        {/* Filter Bar */}
        <FilterBar
          bulan={bulan}
          tahun={tahun}
          onBulanChange={setBulan}
          onTahunChange={setTahun}
          onRefresh={() => fetchData(bulan, tahun)}
          isLoading={loading}
        />

        {/* Top Performer Card Highlights */}
        {data?.matrixHarian && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {data.matrixHarian
              .slice()
              .sort((a, b) => b.achievement - a.achievement)
              .slice(0, 3)
              .map((top, idx) => (
                <div
                  key={idx}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                      {idx === 0 ? <Trophy className="w-5 h-5 text-amber-500" /> : `#${idx + 1}`}
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase block">
                        Rank #{idx + 1} Inputer
                      </span>
                      <span className="text-sm font-extrabold text-slate-800">{top.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Complete: <b>{top.total}</b></span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${getAchColorClass(top.achievement)}`}>
                      {top.achievement}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'matrix', label: 'Achievement Matrix Harian', icon: Award },
            { id: 'matrix_bulanan', label: 'Achievement Matrix Bulanan', icon: Calendar },
            { id: 'pivot', label: 'Detail Order (Harian)', icon: TableProperties },
            { id: 'grafik', label: 'Grafik & Komposisi', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-red-600 text-red-600 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Achievement Matrix Harian */}
        {activeTab === 'matrix' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-emerald-600 pl-3">
                Matriks Pencapaian Harian — Bulan {bulan} / {tahun}
              </h2>
              <span className="text-xs text-slate-500">
                Pencapaian Complete per Tanggal 1 - 31
              </span>
            </div>

            <div className="overflow-x-auto max-h-[550px]">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold sticky top-0 z-20">
                    <th className="p-3 border-r border-slate-200 sticky left-0 bg-slate-100 z-30 text-left min-w-[140px]">
                      Nama Inputer
                    </th>
                    <th className="p-2 border-r border-slate-200 bg-indigo-50/70 text-indigo-700 min-w-[70px]">
                      Populasi
                    </th>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <th
                        key={d}
                        className={`p-1.5 border-r border-slate-200 min-w-[32px] ${
                          d <= daysInMonth ? 'text-slate-700' : 'text-slate-300 bg-slate-50'
                        }`}
                      >
                        {d}
                      </th>
                    ))}
                    <th className="p-2 border-r border-slate-200 bg-emerald-50/80 text-emerald-700 min-w-[70px]">
                      Total
                    </th>
                    <th className="p-2 bg-slate-200 text-slate-800 min-w-[80px]">
                      % ACH
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data?.matrixHarian.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold border-r border-slate-200 sticky left-0 bg-white text-left text-slate-800">
                        {item.name}
                      </td>
                      <td className="p-2 border-r border-slate-200 font-semibold bg-indigo-50/30 text-indigo-700">
                        {item.populasi}
                      </td>

                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                        const val = item.days?.[d] || 0;
                        const isDayValid = d <= daysInMonth;
                        return (
                          <td
                            key={d}
                            className={`p-1.5 border-r border-slate-100 text-[11px] ${
                              !isDayValid
                                ? 'text-slate-300 bg-slate-50/50'
                                : val > 0
                                ? 'font-semibold text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {isDayValid ? val : '-'}
                          </td>
                        );
                      })}

                      <td className="p-2 border-r border-slate-200 font-bold bg-emerald-50/40 text-emerald-700">
                        {item.total}
                      </td>

                      <td className="p-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] border ${getAchColorClass(
                            item.achievement
                          )}`}
                        >
                          {item.achievement}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Achievement Matrix Bulanan */}
        {activeTab === 'matrix_bulanan' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-indigo-600 pl-3">
                Matriks Pencapaian Bulanan — Tahun {tahun}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                    <th className="p-3 border-r border-slate-200 sticky left-0 bg-slate-100 z-10 text-left min-w-[140px]">
                      Nama Inputer
                    </th>
                    <th className="p-2 border-r bg-indigo-50/70 text-indigo-700">Populasi</th>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m) => (
                      <th key={m} className="p-2 border-r min-w-[45px]">
                        {m}
                      </th>
                    ))}
                    <th className="p-2 border-r bg-emerald-50/80 text-emerald-700">Total</th>
                    <th className="p-2 bg-slate-200 text-slate-800">% ACH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.matrixBulanan.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold border-r border-slate-200 sticky left-0 bg-white text-left">
                        {item.name}
                      </td>
                      <td className="p-2 border-r font-semibold bg-indigo-50/30 text-indigo-700">
                        {item.populasi}
                      </td>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <td key={m} className="p-2 border-r text-[11px] font-medium">
                          {item.months?.[m] || 0}
                        </td>
                      ))}
                      <td className="p-2 border-r font-bold bg-emerald-50/40 text-emerald-700">
                        {item.total}
                      </td>
                      <td className="p-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] border ${getAchColorClass(item.achievement)}`}>
                          {item.achievement}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Detail Pivot Harian */}
        {activeTab === 'pivot' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-red-600 pl-3">
                Detail Status Order Harian (IP / PB / PBIL / Complete)
              </h2>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold sticky top-0 z-20">
                    <th className="p-3 border-r border-slate-200 sticky left-0 bg-slate-100 z-30">Tanggal</th>
                    <th className="p-2 border-r text-blue-600 bg-blue-50/50">IP Total</th>
                    <th className="p-2 border-r text-amber-600 bg-amber-50/50">PB Total</th>
                    <th className="p-2 border-r text-purple-600 bg-purple-50/50">PBIL Total</th>
                    <th className="p-2 text-emerald-600 bg-emerald-50/50">Complete Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.harian.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold border-r sticky left-0 bg-white">{row.periode}</td>
                      <td className="p-2 border-r font-semibold text-blue-600">{row.ip_total}</td>
                      <td className="p-2 border-r font-semibold text-amber-600">{row.pb_total}</td>
                      <td className="p-2 border-r font-semibold text-purple-600">{row.pbil_total}</td>
                      <td className="p-2 font-bold text-emerald-600 bg-emerald-50/30">{row.c_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Grafik */}
        {(activeTab === 'grafik' || activeTab === 'matrix') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <DailyTrendChart
              labels={chartLabelsHarian}
              data={chartValsHarian}
              title={`Trend Harian Complete (Bulan ${bulan}/${tahun})`}
            />
            <StackedCompositionChart
              labels={chartLabelsBulanan}
              datasets={chartDatasetsBulanan}
              title={`Komposisi Bulanan per Inputer (${tahun})`}
            />
          </div>
        )}

      </main>
    </div>
  );
}
