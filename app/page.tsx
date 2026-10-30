'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import KPICards from '@/components/KPICards';
import { GlobalKPIs } from '@/lib/types';
import {
  Users,
  PieChart,
  UserCheck,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const [kpis, setKpis] = useState<GlobalKPIs>({
    inProgress: 0,
    pendingBaso: 0,
    pendingBilling: 0,
    complete: 0,
    totalOrders: 0,
    lastUpdated: '',
  });
  const [loading, setLoading] = useState(true);

  // Indonesian Date Formatting
  const today = new Date();
  const hariArr = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const bulanArr = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const tglSekarang = `${hariArr[today.getDay()]}, ${today.getDate()} ${bulanArr[today.getMonth()]} ${today.getFullYear()}`;

  useEffect(() => {
    async function fetchKPIs() {
      try {
        const res = await fetch('/api/summary');
        if (res.ok) {
          const data = await res.json();
          setKpis(data);
        }
      } catch (err) {
        console.error('Failed to load KPIs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchKPIs();
  }, []);

  const featureCards = [
    {
      title: 'Analytics per Inputer',
      desc: 'Pantau performa harian, bulanan, dan matriks pencapaian petugas inputer (Magfirah, Novita, Nigel, Gita, Wawan, Lila, Yuni).',
      href: '/inputer',
      icon: Users,
      badge: 'Order Processors',
      color: 'from-blue-600 to-indigo-700',
      iconBg: 'bg-blue-50 text-blue-600',
      accent: 'group-hover:border-blue-400',
    },
    {
      title: 'Analytics per Segment',
      desc: 'Pantau komposisi order berdasarkan kategori segmen bisnis (RBS, DGS, DSS, DPS) serta dinamika status order.',
      href: '/segment',
      icon: PieChart,
      badge: 'Business Units',
      color: 'from-red-600 to-rose-700',
      iconBg: 'bg-red-50 text-red-600',
      accent: 'group-hover:border-red-400',
    },
    {
      title: 'Analytics per Account Manager',
      desc: 'Pantau performa harian, bulanan, dan matriks pencapaian 15 Account Manager (AM) Witel Sulbagteng.',
      href: '/am',
      icon: UserCheck,
      badge: 'Account Managers',
      color: 'from-emerald-600 to-teal-700',
      iconBg: 'bg-emerald-50 text-emerald-600',
      accent: 'group-hover:border-emerald-400',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans text-slate-800">
      <Navbar />

      {/* Hero Banner with Modern Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 text-white pt-10 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 shadow-inner">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>{tglSekarang}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                Portal Order <span className="text-red-500">Analytics</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal">
                Sistem Monitoring & Evaluasi Terpadu Witel Sulbagteng — Telkom Indonesia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-10 relative z-20 flex-1 pb-16 w-full">
        
        {/* KPI Cards Row */}
        <div className="mb-12">
          <KPICards
            inProgress={kpis.inProgress}
            pendingBaso={kpis.pendingBaso}
            pendingBilling={kpis.pendingBilling}
            complete={kpis.complete}
            totalOrders={kpis.totalOrders}
            isLoading={loading}
          />
        </div>

        {/* Quick Insights Banner */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Pencapaian Order Bulan Berjalan
              </h4>
              <p className="text-xs sm:text-sm text-slate-500">
                Data order dimutakhirkan secara konsisten dari sistem monitoring NCX Telkom Regional.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/inputer"
              className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Matriks Inputer
            </Link>
            <Link
              href="/am"
              className="w-full sm:w-auto text-center px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm shadow-red-500/20"
            >
              Matriks AM
            </Link>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>© {today.getFullYear()} Telkom Witel Sulbagteng. All rights reserved.</p>
        <p className="mt-1 text-[11px] text-slate-400">Migrated to Next.js 16 & React 19 Enterprise Dashboard</p>
      </footer>
    </div>
  );
}
