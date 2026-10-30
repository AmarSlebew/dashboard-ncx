'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DailyTrendChartProps {
  labels: string[];
  data: number[];
  title?: string;
}

export function DailyTrendChart({
  labels,
  data,
  title = 'Trend Harian (Complete Order)',
}: DailyTrendChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Complete Order',
        data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 12 },
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#64748b' },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10 }, color: '#64748b' },
      },
    },
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        {title}
      </h3>
      <div className="h-64 sm:h-72 w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

interface StackedCompositionChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
  title?: string;
}

export function StackedCompositionChart({
  labels,
  datasets,
  title = 'Komposisi Data Bulanan',
}: StackedCompositionChartProps) {
  const chartData = {
    labels,
    datasets: datasets.map((ds) => ({
      ...ds,
      borderRadius: 4,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 10 }, color: '#64748b' },
      },
      y: {
        stacked: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10 }, color: '#64748b' },
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: { size: 11, weight: 'bold' as const },
          color: '#475569',
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 12 },
        cornerRadius: 8,
      },
    },
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
        {title}
      </h3>
      <div className="h-64 sm:h-72 w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
