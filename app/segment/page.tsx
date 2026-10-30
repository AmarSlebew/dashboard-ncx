'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import FilterBar from '@/components/FilterBar';
import { DailyTrendChart, StackedCompositionChart } from '@/components/Charts';
import { SegmentResponse } from '@/lib/types';
import { formatBulanIndo } from '@/lib/utils';
import { Building2, Layers, Calendar, BarChart3 } from 'lucide-react';

export default function SegmentPage() {
  const now = new Date();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
  const currentYear = now.getFullYear().toString();

  const [bulan, setBulan] = useState(currentMonth);
  const [tahun, setTahun] = useState(currentYear);
  const [data, setData] = useState<SegmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'harian' | 'bulanan' | 'tahunan' | 'grafik'>('harian');

  const fetchData = async (m = bulan, y = tahun) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/segment?bulan=${m}&tahun=${y}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch segment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(bulan, tahun);
  }, [bulan, tahun]);

  // Chart preparation
  const chartLabelsHarian = data?.harian.map((row) => row.periode.substring(0, 2)) || [];
  const chartValsHarian = data?.harian.map((row) => row.c_total) || [];

  const chartLabelsBulanan = data?.bulanan.map((row) => formatBulanIndo(row.periode)) || [];
  const chartDatasetsBulanan = [
    { label: 'RBS', data: data?.bulanan.map((r) => r.c_rbs) || [], backgroundColor: '#6366f1' },
    { label: 'DGS', data: data?.bulanan.map((r) => r.c_dgs) || [], backgroundColor: '#f43f5e' },
    { label: 'DSS', data: data?.bulanan.map((r) => r.c_dss) || [], backgroundColor: '#fbbf24' },
    { label: 'DPS', data: data?.bulanan.map((r) => r.c_dps) || [], backgroundColor: '#10b981' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans text-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Business Units Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Data <span className="text-red-600">Segments</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Menampilkan data pengawalan order berdasarkan kategori unit segmen (RBS, DGS, DSS, DPS).
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

        {/* Segment Summary Cards */}
        {data?.kpis && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { name: 'RBS', data: data.kpis.rbs, color: 'text-indigo-600', border: 'border-indigo-200' },
              { name: 'DGS', data: data.kpis.dgs, color: 'text-rose-600', border: 'border-rose-200' },
              { name: 'DSS', data: data.kpis.dss, color: 'text-amber-600', border: 'border-amber-200' },
              { name: 'DPS', data: data.kpis.dps, color: 'text-emerald-600', border: 'border-emerald-200' },
            ].map((seg) => (
              <div
                key={seg.name}
                className={`bg-white p-4 rounded-2xl border ${seg.border} shadow-xs flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-extrabold ${seg.color}`}>Segmen {seg.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Total: {seg.data.total}
                  </span>
                </div>
                <div className="grid grid-cols-4 text-center gap-1 text-[11px] pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">IP</span>
                    <span className="font-bold text-blue-600">{seg.data.ip}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">PB</span>
                    <span className="font-bold text-amber-600">{seg.data.pb}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">PBIL</span>
                    <span className="font-bold text-purple-600">{seg.data.pbil}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Comp</span>
                    <span className="font-bold text-emerald-600">{seg.data.complete}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1">
          {[
            { id: 'harian', label: 'View Harian (Per Tanggal)', icon: Calendar },
            { id: 'bulanan', label: 'View Bulanan (Jan - Des)', icon: Layers },
            { id: 'tahunan', label: 'View Tahunan', icon: Building2 },
            { id: 'grafik', label: 'Grafik & Visualisasi', icon: BarChart3 },
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

        {/* Tab 1: View Harian */}
        {activeTab === 'harian' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-red-600 pl-3">
                Tabel Snapshot Harian — Bulan {bulan} / {tahun}
              </h2>
              <span className="text-xs text-slate-500">
                Total {data?.harian.length || 0} hari terekam
              </span>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold sticky top-0 z-20">
                    <th rowSpan={2} className="p-3 border-r border-slate-200 sticky left-0 bg-slate-100 z-30">
                      Tanggal
                    </th>
                    <th colSpan={5} className="p-2 border-r border-b border-slate-200 text-blue-600 bg-blue-50/50">
                      In Progress
                    </th>
                    <th colSpan={5} className="p-2 border-r border-b border-slate-200 text-amber-600 bg-amber-50/50">
                      Pending BASO
                    </th>
                    <th colSpan={5} className="p-2 border-r border-b border-slate-200 text-purple-600 bg-purple-50/50">
                      Pending Billing
                    </th>
                    <th colSpan={5} className="p-2 border-b border-slate-200 text-emerald-600 bg-emerald-50/50">
                      Complete
                    </th>
                  </tr>
                  <tr className="bg-slate-50 text-[9px] font-semibold text-slate-500 sticky top-7 z-20">
                    {/* In Progress */}
                    <th className="p-1.5 border-r border-slate-200">RBS</th>
                    <th className="p-1.5 border-r border-slate-200">DGS</th>
                    <th className="p-1.5 border-r border-slate-200">DSS</th>
                    <th className="p-1.5 border-r border-slate-200">DPS</th>
                    <th className="p-1.5 border-r border-slate-300 font-bold bg-blue-100/60 text-blue-700">TOTAL</th>

                    {/* Pending BASO */}
                    <th className="p-1.5 border-r border-slate-200">RBS</th>
                    <th className="p-1.5 border-r border-slate-200">DGS</th>
                    <th className="p-1.5 border-r border-slate-200">DSS</th>
                    <th className="p-1.5 border-r border-slate-200">DPS</th>
                    <th className="p-1.5 border-r border-slate-300 font-bold bg-amber-100/60 text-amber-700">TOTAL</th>

                    {/* Pending Billing */}
                    <th className="p-1.5 border-r border-slate-200">RBS</th>
                    <th className="p-1.5 border-r border-slate-200">DGS</th>
                    <th className="p-1.5 border-r border-slate-200">DSS</th>
                    <th className="p-1.5 border-r border-slate-200">DPS</th>
                    <th className="p-1.5 border-r border-slate-300 font-bold bg-purple-100/60 text-purple-700">TOTAL</th>

                    {/* Complete */}
                    <th className="p-1.5 border-r border-slate-200">RBS</th>
                    <th className="p-1.5 border-r border-slate-200">DGS</th>
                    <th className="p-1.5 border-r border-slate-200">DSS</th>
                    <th className="p-1.5 border-r border-slate-200">DPS</th>
                    <th className="p-1.5 font-bold bg-emerald-100/60 text-emerald-700">TOTAL</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-xs">
                  {data?.harian.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2.5 font-bold border-r border-slate-200 sticky left-0 bg-white">
                        {row.periode}
                      </td>

                      {/* IP */}
                      <td className="p-2 border-r border-slate-100">{row.ip_rbs}</td>
                      <td className="p-2 border-r border-slate-100">{row.ip_dgs}</td>
                      <td className="p-2 border-r border-slate-100">{row.ip_dss}</td>
                      <td className="p-2 border-r border-slate-100">{row.ip_dps}</td>
                      <td className="p-2 border-r border-slate-200 font-bold bg-blue-50/50 text-blue-700">{row.ip_total}</td>

                      {/* PB */}
                      <td className="p-2 border-r border-slate-100">{row.pb_rbs}</td>
                      <td className="p-2 border-r border-slate-100">{row.pb_dgs}</td>
                      <td className="p-2 border-r border-slate-100">{row.pb_dss}</td>
                      <td className="p-2 border-r border-slate-100">{row.pb_dps}</td>
                      <td className="p-2 border-r border-slate-200 font-bold bg-amber-50/50 text-amber-700">{row.pb_total}</td>

                      {/* PBIL */}
                      <td className="p-2 border-r border-slate-100">{row.pbil_rbs}</td>
                      <td className="p-2 border-r border-slate-100">{row.pbil_dgs}</td>
                      <td className="p-2 border-r border-slate-100">{row.pbil_dss}</td>
                      <td className="p-2 border-r border-slate-100">{row.pbil_dps}</td>
                      <td className="p-2 border-r border-slate-200 font-bold bg-purple-50/50 text-purple-700">{row.pbil_total}</td>

                      {/* Complete */}
                      <td className="p-2 border-r border-slate-100">{row.c_rbs}</td>
                      <td className="p-2 border-r border-slate-100">{row.c_dgs}</td>
                      <td className="p-2 border-r border-slate-100">{row.c_dss}</td>
                      <td className="p-2 border-r border-slate-100">{row.c_dps}</td>
                      <td className="p-2 font-bold bg-emerald-50/50 text-emerald-700">{row.c_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: View Bulanan */}
        {activeTab === 'bulanan' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-indigo-600 pl-3">
                Tabel Snapshot Bulanan — Tahun {tahun}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                    <th rowSpan={2} className="p-3 border-r border-slate-200 sticky left-0 bg-slate-100 z-10">
                      Bulan
                    </th>
                    <th colSpan={5} className="p-2 border-r border-b border-slate-200 text-blue-600 bg-blue-50/50">In Progress</th>
                    <th colSpan={5} className="p-2 border-r border-b border-slate-200 text-amber-600 bg-amber-50/50">Pending BASO</th>
                    <th colSpan={5} className="p-2 border-r border-b border-slate-200 text-purple-600 bg-purple-50/50">Pending Billing</th>
                    <th colSpan={5} className="p-2 border-b border-slate-200 text-emerald-600 bg-emerald-50/50">Complete</th>
                  </tr>
                  <tr className="bg-slate-50 text-[9px] font-semibold text-slate-500">
                    <th className="p-1.5 border-r">RBS</th><th className="p-1.5 border-r">DGS</th><th className="p-1.5 border-r">DSS</th><th className="p-1.5 border-r">DPS</th><th className="p-1.5 border-r font-bold bg-blue-100/60 text-blue-700">TOTAL</th>
                    <th className="p-1.5 border-r">RBS</th><th className="p-1.5 border-r">DGS</th><th className="p-1.5 border-r">DSS</th><th className="p-1.5 border-r">DPS</th><th className="p-1.5 border-r font-bold bg-amber-100/60 text-amber-700">TOTAL</th>
                    <th className="p-1.5 border-r">RBS</th><th className="p-1.5 border-r">DGS</th><th className="p-1.5 border-r">DSS</th><th className="p-1.5 border-r">DPS</th><th className="p-1.5 border-r font-bold bg-purple-100/60 text-purple-700">TOTAL</th>
                    <th className="p-1.5 border-r">RBS</th><th className="p-1.5 border-r">DGS</th><th className="p-1.5 border-r">DSS</th><th className="p-1.5 border-r">DPS</th><th className="p-1.5 font-bold bg-emerald-100/60 text-emerald-700">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data?.bulanan.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold border-r border-slate-200 sticky left-0 bg-white">
                        {formatBulanIndo(row.periode)}
                      </td>
                      <td className="p-2 border-r">{row.ip_rbs}</td><td className="p-2 border-r">{row.ip_dgs}</td><td className="p-2 border-r">{row.ip_dss}</td><td className="p-2 border-r">{row.ip_dps}</td><td className="p-2 border-r font-bold bg-blue-50/50 text-blue-700">{row.ip_total}</td>
                      <td className="p-2 border-r">{row.pb_rbs}</td><td className="p-2 border-r">{row.pb_dgs}</td><td className="p-2 border-r">{row.pb_dss}</td><td className="p-2 border-r">{row.pb_dps}</td><td className="p-2 border-r font-bold bg-amber-50/50 text-amber-700">{row.pb_total}</td>
                      <td className="p-2 border-r">{row.pbil_rbs}</td><td className="p-2 border-r">{row.pbil_dgs}</td><td className="p-2 border-r">{row.pbil_dss}</td><td className="p-2 border-r">{row.pbil_dps}</td><td className="p-2 border-r font-bold bg-purple-50/50 text-purple-700">{row.pbil_total}</td>
                      <td className="p-2 border-r">{row.c_rbs}</td><td className="p-2 border-r">{row.c_dgs}</td><td className="p-2 border-r">{row.c_dss}</td><td className="p-2 border-r">{row.c_dps}</td><td className="p-2 font-bold bg-emerald-50/50 text-emerald-700">{row.c_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: View Tahunan */}
        {activeTab === 'tahunan' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mb-8">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800 border-l-4 border-emerald-600 pl-3">
                Tabel Snapshot Tahunan
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                    <th rowSpan={2} className="p-3 border-r border-slate-200 sticky left-0 bg-slate-100 z-10">
                      Tahun
                    </th>
                    <th colSpan={5} className="p-2 border-r border-b text-blue-600 bg-blue-50/50">In Progress</th>
                    <th colSpan={5} className="p-2 border-r border-b text-amber-600 bg-amber-50/50">Pending BASO</th>
                    <th colSpan={5} className="p-2 border-r border-b text-purple-600 bg-purple-50/50">Pending Billing</th>
                    <th colSpan={5} className="p-2 border-b text-emerald-600 bg-emerald-50/50">Complete</th>
                  </tr>
                  <tr className="bg-slate-50 text-[9px] font-semibold text-slate-500">
                    <th className="p-1.5 border-r">RBS</th><th className="p-1.5 border-r">DGS</th><th className="p-1.5 border-r">DSS</th><th className="p-1.5 border-r">DPS</th><th className="p-1.5 border-r font-bold bg-blue-100/60 text-blue-700">TOTAL</th>
                    <th className="p-1.5 border-r">RBS</th><th className="p-1.5 border-r">DGS</th><th className="p-1.5 border-r">DSS</th><th className="p-1.5 border-r">DPS</th><th className="p-1.5 border-r font-bold bg-amber-100/60 text-amber-700">TOTAL</th>
                    <th className="p-1.5 border-r">RBS</th><th className="p-1.5 border-r">DGS</th><th className="p-1.5 border-r">DSS</th><th className="p-1.5 border-r">DPS</th><th className="p-1.5 border-r font-bold bg-purple-100/60 text-purple-700">TOTAL</th>
                    <th className="p-1.5 border-r">RBS</th><th className="p-1.5 border-r">DGS</th><th className="p-1.5 border-r">DSS</th><th className="p-1.5 border-r">DPS</th><th className="p-1.5 font-bold bg-emerald-100/60 text-emerald-700">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {data?.tahunan.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold border-r border-slate-200 sticky left-0 bg-white">
                        {row.periode}
                      </td>
                      <td className="p-2 border-r">{row.ip_rbs}</td><td className="p-2 border-r">{row.ip_dgs}</td><td className="p-2 border-r">{row.ip_dss}</td><td className="p-2 border-r">{row.ip_dps}</td><td className="p-2 border-r font-bold bg-blue-50/50 text-blue-700">{row.ip_total}</td>
                      <td className="p-2 border-r">{row.pb_rbs}</td><td className="p-2 border-r">{row.pb_dgs}</td><td className="p-2 border-r">{row.pb_dss}</td><td className="p-2 border-r">{row.pb_dps}</td><td className="p-2 border-r font-bold bg-amber-50/50 text-amber-700">{row.pb_total}</td>
                      <td className="p-2 border-r">{row.pbil_rbs}</td><td className="p-2 border-r">{row.pbil_dgs}</td><td className="p-2 border-r">{row.pbil_dss}</td><td className="p-2 border-r">{row.pbil_dps}</td><td className="p-2 border-r font-bold bg-purple-50/50 text-purple-700">{row.pbil_total}</td>
                      <td className="p-2 border-r">{row.c_rbs}</td><td className="p-2 border-r">{row.c_dgs}</td><td className="p-2 border-r">{row.c_dss}</td><td className="p-2 border-r">{row.c_dps}</td><td className="p-2 font-bold bg-emerald-50/50 text-emerald-700">{row.c_total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Grafik & Visualisasi */}
        {(activeTab === 'grafik' || activeTab === 'harian') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <DailyTrendChart
              labels={chartLabelsHarian}
              data={chartValsHarian}
              title={`Trend Harian Complete (Bulan ${bulan}/${tahun})`}
            />
            <StackedCompositionChart
              labels={chartLabelsBulanan}
              datasets={chartDatasetsBulanan}
              title={`Komposisi Bulanan per Segmen (${tahun})`}
            />
          </div>
        )}

      </main>
    </div>
  );
}
