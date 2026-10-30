'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';
import { DailyTrendChart } from '@/components/Charts';
import { AMResponse } from '@/lib/types';
import { getDaysInMonth } from '@/lib/utils';
import { UserCheck, Award, Calendar, Trophy, Medal, Star } from 'lucide-react';

export default function AMPage() {
  const now = new Date();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = now.getFullYear().toString();

  const [bulan, setBulan] = useState(currentMonth);
  const [tahun, setTahun] = useState(currentYear);
  const [data, setData] = useState<AMResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matrix_harian' | 'matrix_bulanan' | 'leaderboard'>('matrix_harian');

  const daysInMonth = getDaysInMonth(parseInt(bulan, 10), parseInt(tahun, 10));

  const fetchData = async (m = bulan, y = tahun) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/am?bulan=${m}&tahun=${y}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch AM data:', err);
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

  // Calculate daily totals across all AMs
  const totalPerDay: Record<number, number> = {};
  for (let d = 1; d <= 31; d++) {
    totalPerDay[d] = 0;
  }
  let totalPopAll = 0;
  let totalCompleteAll = 0;

  data?.matrixHarian.forEach((item) => {
    totalPopAll += item.populasi;
    totalCompleteAll += item.total;
    for (let d = 1; d <= 31; d++) {
      totalPerDay[d] += item.days?.[d] || 0;
    }
  });

  const totalAchOverall = totalPopAll > 0 ? parseFloat(((totalCompleteAll / totalPopAll) * 100).toFixed(1)) : 0;

  // Chart
  const chartLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
  const chartData = chartLabels.map((d) => totalPerDay[parseInt(d, 10)] || 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans text-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            <UserCheck className="w-4 h-4" />
            <span>Account Management Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Data <span className="text-red-600">Account Manager</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Monitoring pencapaian order dan evaluasi performa 15 Account Manager Witel Sulbagteng.
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

        {/* AM Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block">Total Target / Populasi</span>
              <span className="text-2xl font-extrabold text-slate-800">{totalPopAll.toLocaleString('id-ID')}</span>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block">Total Complete AM</span>
              <span className="text-2xl font-extrabold text-emerald-600">{totalCompleteAll.toLocaleString('id-ID')}</span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Trophy className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-slate-400 block">Rata-rata Pencapaian (% ACH)</span>
              <span className="text-2xl font-extrabold text-slate-900">{totalAchOverall}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'matrix_harian', label: 'View Harian (Complete Order)', icon: Award },
            { id: 'matrix_bulanan', label: 'View Bulanan (Jan - Des)', icon: Calendar },
            { id: 'leaderboard', label: 'AM Leaderboard & Grafik', icon: Trophy },
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

        {/* Tab 1: Matrix Harian */}
        {activeTab === 'matrix_harian' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-red-600 pl-3">
                Matriks Pencapaian Harian AM (Delta Complete) — Bulan {bulan} / {tahun}
              </h2>
              <span className="text-xs text-slate-500">15 Account Manager Aktif</span>
            </div>

            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold sticky top-0 z-20">
                    <th className="p-3 border-r border-slate-200 sticky left-0 bg-slate-100 z-30 text-left min-w-[160px]">
                      Nama AM
                    </th>
                    <th className="p-2 border-r border-slate-200 bg-indigo-50/70 text-indigo-700 min-w-[70px]">
                      Populasi
                    </th>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <th
                        key={d}
                        className={`p-1.5 border-r border-slate-200 min-w-[30px] ${
                          d <= daysInMonth ? 'text-slate-700' : 'text-slate-300 bg-slate-50'
                        }`}
                      >
                        {d}
                      </th>
                    ))}
                    <th className="p-2 border-r border-slate-200 bg-emerald-50/80 text-emerald-700 min-w-[70px]">
                      Total
                    </th>
                    <th className="p-2 bg-slate-200 text-slate-800 min-w-[75px]">
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
                                ? 'font-semibold text-slate-800 bg-emerald-50/20'
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

                {/* Footer Totals Row */}
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 sticky bottom-0 z-20">
                    <td className="p-3 text-left border-r sticky left-0 bg-slate-100">
                      TOTAL ALL AM
                    </td>
                    <td className="p-2 border-r bg-indigo-100 text-indigo-800">
                      {totalPopAll}
                    </td>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <td key={d} className="p-1.5 border-r text-[11px]">
                        {d <= daysInMonth ? totalPerDay[d] : '-'}
                      </td>
                    ))}
                    <td className="p-2 border-r bg-emerald-100 text-emerald-800">
                      {totalCompleteAll}
                    </td>
                    <td className="p-2 bg-slate-300 text-slate-900 font-extrabold">
                      {totalAchOverall}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Matrix Bulanan */}
        {activeTab === 'matrix_bulanan' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-indigo-600 pl-3">
                Matriks Pencapaian Bulanan AM — Tahun {tahun}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                    <th className="p-3 border-r sticky left-0 bg-slate-100 z-10 text-left min-w-[160px]">
                      Nama AM
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
                      <td className="p-2.5 font-bold border-r sticky left-0 bg-white text-left">
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

        {/* Tab 3: Leaderboard & Charts */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>Peringkat Performa AM (% Achievement)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.matrixHarian
                  .slice()
                  .sort((a, b) => b.achievement - a.achievement)
                  .map((am, rank) => (
                    <div
                      key={am.name}
                      className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            rank === 0
                              ? 'bg-amber-100 text-amber-700'
                              : rank === 1
                              ? 'bg-slate-200 text-slate-700'
                              : rank === 2
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          #{rank + 1}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-800">{am.name}</div>
                          <div className="text-[10px] text-slate-400">
                            Populasi: {am.populasi} | Complete: {am.total}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getAchColorClass(am.achievement)}`}>
                        {am.achievement}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <DailyTrendChart
              labels={chartLabels}
              data={chartData}
              title={`Trend Harian Complete Semua AM (Bulan ${bulan}/${tahun})`}
            />
          </div>
        )}

      </main>
    </div>
  );
}
