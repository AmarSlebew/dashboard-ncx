'use client';

import React from 'react';
import { Clock, FileText, Receipt, CheckCircle2 } from 'lucide-react';

interface KPICardsProps {
  inProgress: number;
  pendingBaso: number;
  pendingBilling: number;
  complete: number;
  totalOrders?: number;
  isLoading?: boolean;
}

export default function KPICards({
  inProgress,
  pendingBaso,
  pendingBilling,
  complete,
  totalOrders = 0,
  isLoading = false,
}: KPICardsProps) {
  const total = totalOrders || (inProgress + pendingBaso + pendingBilling + complete) || 1;

  const cards = [
    {
      label: 'In Progress (Terbaru)',
      value: inProgress,
      percentage: ((inProgress / total) * 100).toFixed(1),
      icon: Clock,
      color: 'blue',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-200/80',
      ringColor: 'focus:ring-blue-500',
      gradient: 'from-blue-500/10 via-transparent to-transparent',
    },
    {
      label: 'Pending BASO (Terbaru)',
      value: pendingBaso,
      percentage: ((pendingBaso / total) * 100).toFixed(1),
      icon: FileText,
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-200/80',
      ringColor: 'focus:ring-amber-500',
      gradient: 'from-amber-500/10 via-transparent to-transparent',
    },
    {
      label: 'Pending Billing (Terbaru)',
      value: pendingBilling,
      percentage: ((pendingBilling / total) * 100).toFixed(1),
      icon: Receipt,
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50/80',
      borderColor: 'border-purple-200/80',
      ringColor: 'focus:ring-purple-500',
      gradient: 'from-purple-500/10 via-transparent to-transparent',
    },
    {
      label: 'Complete (Terbaru)',
      value: complete,
      percentage: ((complete / total) * 100).toFixed(1),
      icon: CheckCircle2,
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-200/80',
      ringColor: 'focus:ring-emerald-500',
      gradient: 'from-emerald-500/10 via-transparent to-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl bg-white p-5 border ${card.borderColor} shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-gradient-to-br ${card.gradient}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.textColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              {isLoading ? (
                <div className="h-9 w-24 bg-slate-200 animate-pulse rounded-lg"></div>
              ) : (
                <div className={`text-3xl font-extrabold tracking-tight ${card.textColor}`}>
                  {card.value.toLocaleString('id-ID')}
                </div>
              )}

              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {card.percentage}%
              </span>
            </div>

            <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  card.textColor.replace('text-', 'bg-')
                } transition-all duration-500`}
                style={{ width: `${Math.min(100, parseFloat(card.percentage))}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
