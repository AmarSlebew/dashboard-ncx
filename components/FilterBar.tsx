
'use client';

import React from 'react';
import { Calendar, RefreshCw } from 'lucide-react';

interface FilterBarProps {
  bulan: string;
  tahun: string;
  onBulanChange: (val: string) => void;
  onTahunChange: (val: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const MONTHS = [
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const currentYear = new Date().getFullYear();
const baseYear = 2024;
const YEARS = Array.from(
  { length: Math.max(1, currentYear - baseYear + 1) },
  (_, i) => String(currentYear - i)
);

export default function FilterBar({
  bulan,
  tahun,
  onBulanChange,
  onTahunChange,
  onRefresh,
  isLoading = false,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6">
      
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider pl-1">
          <Calendar className="w-4 h-4 text-red-600" />
          <span>Filter Periode:</span>
        </div>

        {/* Month Selector */}
        <select
          value={bulan}
          onChange={(e) => onBulanChange(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none cursor-pointer transition-colors hover:bg-slate-100"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Year Selector */}
        <select
          value={tahun}
          onChange={(e) => onTahunChange(e.target.value)}
          className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none cursor-pointer transition-colors hover:bg-slate-100"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-300 text-slate-600 hover:text-red-600 hover:bg-slate-50 transition-colors focus:outline-none disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-red-600' : ''}`} />
          </button>
        )}
      </div>

    </div>
  );
}
