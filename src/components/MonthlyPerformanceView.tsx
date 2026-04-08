'use client';

import { useState } from 'react';
import clientsData from '@/data/clients.json';

interface Client {
  id: string;
  name: string;
  category: string;
  lastMonthTpv: number;
  prevMonthTpv: number;
  monthlyAvgTpv: number;
  stage: string;
  accountManager: string;
}

interface Props {
  dark: boolean;
}

function MoMBadge({ current, prev, dark }: { current: number; prev: number; dark: boolean }) {
  if (!prev || prev === 0) {
    if (current > 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">New</span>;
    return null;
  }
  const pct = ((current - prev) / prev) * 100;
  const isUp = pct >= 0;
  const abs = Math.abs(pct);
  const label = `${isUp ? '+' : ''}${pct.toFixed(1)}%`;

  if (abs < 2) {
    return <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-400'}`}>≈ Flat</span>;
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
      isUp
        ? 'bg-green-500/15 text-green-400'
        : 'bg-red-500/15 text-red-400'
    }`}>
      {isUp ? '▲' : '▼'} {label}
    </span>
  );
}

function formatUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

export default function MonthlyPerformanceView({ dark }: Props) {
  const [sortBy, setSortBy] = useState<'tpv' | 'mom' | 'name'>('tpv');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const clients = (clientsData as Client[]).filter(c => c.lastMonthTpv > 0 || c.prevMonthTpv > 0);

  const categories = ['All', ...Array.from(new Set(clients.map(c => c.category).filter(Boolean)))];

  const filtered = filterCategory === 'All' ? clients : clients.filter(c => c.category === filterCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'tpv') return b.lastMonthTpv - a.lastMonthTpv;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'mom') {
      const momA = a.prevMonthTpv > 0 ? (a.lastMonthTpv - a.prevMonthTpv) / a.prevMonthTpv : 0;
      const momB = b.prevMonthTpv > 0 ? (b.lastMonthTpv - b.prevMonthTpv) / b.prevMonthTpv : 0;
      return momB - momA;
    }
    return 0;
  });

  const totalMar = clients.reduce((s, c) => s + c.lastMonthTpv, 0);
  const totalFeb = clients.reduce((s, c) => s + c.prevMonthTpv, 0);
  const totalMoM = totalFeb > 0 ? ((totalMar - totalFeb) / totalFeb) * 100 : 0;

  const activeClients = clients.filter(c => c.lastMonthTpv > 0).length;
  const growingClients = clients.filter(c => c.prevMonthTpv > 0 && c.lastMonthTpv > c.prevMonthTpv).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>📈 Monthly Performance</h1>
        <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>March 2026 vs February 2026</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'March TPV', value: formatUSD(totalMar), sub: 'total processed' },
          { label: 'Feb TPV', value: formatUSD(totalFeb), sub: 'prior month' },
          { label: 'MoM Growth', value: `${totalMoM >= 0 ? '+' : ''}${totalMoM.toFixed(1)}%`, sub: 'overall', highlight: totalMoM > 0 ? 'green' : 'red' },
          { label: 'Active Clients', value: `${activeClients}`, sub: `${growingClients} growing` },
        ].map(({ label, value, sub, highlight }) => (
          <div key={label} className={`rounded-xl p-4 border ${dark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
            <p className={`text-xs uppercase tracking-wider mb-1 ${dark ? 'text-white/30' : 'text-gray-400'}`}>{label}</p>
            <p className={`text-xl font-bold ${
              highlight === 'green' ? 'text-green-400' :
              highlight === 'red' ? 'text-red-400' :
              dark ? 'text-white' : 'text-gray-900'
            }`}>{value}</p>
            <p className={`text-xs mt-0.5 ${dark ? 'text-white/20' : 'text-gray-400'}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-wrap gap-3 mb-5 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : dark ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {[['tpv', 'By TPV'], ['mom', 'By MoM'], ['name', 'A–Z']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setSortBy(val as 'tpv' | 'mom' | 'name')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sortBy === val
                  ? dark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'
                  : dark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* League Table */}
      <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-white/5' : 'border-gray-100'}`}>
        {/* Table header */}
        <div className={`grid grid-cols-12 px-4 py-2 text-xs font-semibold uppercase tracking-wider ${dark ? 'bg-white/3 text-white/25 border-b border-white/5' : 'bg-gray-50 text-gray-400 border-b border-gray-100'}`}>
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-4">Client</div>
          <div className="col-span-2 text-right">Mar TPV</div>
          <div className="col-span-2 text-right">Feb TPV</div>
          <div className="col-span-2 text-right">MoM</div>
          <div className="col-span-1 text-right hidden md:block">Txns</div>
        </div>

        {sorted.map((client, idx) => {
          const barWidth = totalMar > 0 ? (client.lastMonthTpv / totalMar) * 100 : 0;
          const isTop3 = idx < 3;

          return (
            <div
              key={client.id}
              className={`relative grid grid-cols-12 px-4 py-3 items-center border-b last:border-0 transition-colors ${
                dark
                  ? 'border-white/5 hover:bg-white/3'
                  : 'border-gray-50 hover:bg-gray-50'
              }`}
            >
              {/* TPV bar background */}
              <div
                className={`absolute left-0 top-0 bottom-0 opacity-5 ${isTop3 ? 'bg-indigo-400' : dark ? 'bg-white' : 'bg-indigo-200'}`}
                style={{ width: `${barWidth}%` }}
              />

              {/* Rank */}
              <div className="col-span-1 text-center relative">
                {idx < 3 ? (
                  <span className="text-base">{['🥇','🥈','🥉'][idx]}</span>
                ) : (
                  <span className={`text-xs font-mono ${dark ? 'text-white/20' : 'text-gray-300'}`}>{idx + 1}</span>
                )}
              </div>

              {/* Name */}
              <div className="col-span-4 relative">
                <p className={`text-sm font-medium truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{client.name}</p>
                {client.category && (
                  <p className={`text-xs truncate ${dark ? 'text-white/25' : 'text-gray-400'}`}>{client.category}</p>
                )}
              </div>

              {/* Mar TPV */}
              <div className="col-span-2 text-right relative">
                <span className={`text-sm font-semibold tabular-nums ${client.lastMonthTpv > 0 ? (dark ? 'text-white' : 'text-gray-900') : (dark ? 'text-white/20' : 'text-gray-300')}`}>
                  {client.lastMonthTpv > 0 ? formatUSD(client.lastMonthTpv) : '—'}
                </span>
              </div>

              {/* Feb TPV */}
              <div className="col-span-2 text-right relative">
                <span className={`text-sm tabular-nums ${dark ? 'text-white/40' : 'text-gray-400'}`}>
                  {client.prevMonthTpv > 0 ? formatUSD(client.prevMonthTpv) : '—'}
                </span>
              </div>

              {/* MoM */}
              <div className="col-span-2 text-right relative">
                <MoMBadge current={client.lastMonthTpv} prev={client.prevMonthTpv} dark={dark} />
              </div>

              {/* Spacer for txn count col on mobile */}
              <div className="col-span-1 hidden md:block" />
            </div>
          );
        })}
      </div>

      <p className={`text-xs mt-4 ${dark ? 'text-white/15' : 'text-gray-300'}`}>
        Data sourced from Metabase Q323 · March & February 2026
      </p>
    </div>
  );
}
