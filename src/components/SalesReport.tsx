'use client';

import { useState, useEffect } from 'react';

interface SalesData {
  leads: {
    total: number;
    totalTPV: number;
    byStage: { stage: string; count: number; tpv: number }[];
  };
  deals: {
    total: number;
    totalARR: number;
    wonARR: number;
    wonCount: number;
    activeARR: number;
    byStage: { stage: string; count: number; arr: number }[];
  };
  customers: {
    total: number;
    list: { name: string; stage: string }[];
  };
  generatedAt: string;
}

interface Props {
  dark: boolean;
}

function fmt(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function StatCard({ label, value, sub, dark, color }: { label: string; value: string; sub?: string; dark: boolean; color: string }) {
  return (
    <div className={`rounded-2xl p-5 border ${dark ? `bg-[#1a1a1a] ${color}` : `bg-white border-gray-100 shadow-sm`}`}>
      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${dark ? 'text-white/40' : 'text-gray-400'}`}>{label}</p>
      <p className={`text-3xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>{sub}</p>}
    </div>
  );
}

export default function SalesReport({ dark }: Props) {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetch('/api/sales-report')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load data'); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const STAGE_COLORS: Record<string, string> = {
    'Won 🎉': 'bg-green-500/20 text-green-400',
    'Hunting': 'bg-indigo-500/20 text-indigo-400',
    'Hot Lead': 'bg-orange-500/20 text-orange-400',
    'Onboarding': 'bg-blue-500/20 text-blue-400',
    'Activation': 'bg-cyan-500/20 text-cyan-400',
    'Gone cold': 'bg-gray-500/20 text-gray-400',
    'Lost': 'bg-red-500/20 text-red-400',
    'Blocked': 'bg-yellow-500/20 text-yellow-400',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>📊 Sales Overview</h1>
          <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>
            Live from Attio CRM{data ? ` · ${new Date(data.generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}` : ''}
          </p>
        </div>
        <button onClick={load} disabled={loading} className={`text-sm px-4 py-2 rounded-lg border transition-all ${dark ? 'border-white/10 text-white/50 hover:border-indigo-400 hover:text-white disabled:opacity-30' : 'border-gray-200 text-gray-500 hover:border-indigo-300 disabled:opacity-30'}`}>
          {loading ? '⟳ Loading...' : '↻ Refresh'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading && !data && (
        <div className={`text-center py-20 ${dark ? 'text-white/20' : 'text-gray-300'}`}>
          <div className="text-4xl mb-3 animate-pulse">📊</div>
          <p>Loading from Attio...</p>
        </div>
      )}

      {data && (
        <div className="space-y-8">
          {/* The Big Picture */}
          <div className={`rounded-2xl border px-6 py-5 mb-2 ${dark ? 'bg-indigo-950/40 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${dark ? 'text-indigo-400' : 'text-indigo-500'}`}>The Big Picture</p>
            <p className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>Are we actually tracking toward meaningful growth?</p>
            <div className="flex items-center justify-between gap-6">
              <div className={`rounded-xl px-5 py-3 flex-shrink-0 ${dark ? 'bg-white/5' : 'bg-white shadow-sm'}`}>
                <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>Monthly TPV Estimate</p>
                <p className={`text-2xl font-bold mt-0.5 ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>$10M</p>
                <p className={`text-xs mt-0.5 ${dark ? 'text-white/20' : 'text-gray-400'}`}>= $120M ÷ 12</p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>Customer Annual TPV Target</p>
                <p className={`text-3xl font-bold mt-1 ${dark ? 'text-white' : 'text-gray-900'}`}>$120M</p>
              </div>
            </div>
          </div>

          {/* Summary — 3 clean sections */}
          <div className={`rounded-2xl border divide-y ${dark ? 'bg-[#1a1a1a] border-white/8 divide-white/5' : 'bg-white border-gray-100 divide-gray-100 shadow-sm'}`}>
            {/* Targets */}
            <div className="px-6 py-5 flex items-center justify-between gap-6">
              <div>
                <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>Total Targets in CRM</p>
                <p className={`text-3xl font-bold mt-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{data.leads.total.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`text-right rounded-xl px-4 py-3 ${dark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>Est. Monthly TPV</p>
                  <p className={`text-xl font-bold mt-0.5 ${dark ? 'text-indigo-300' : 'text-indigo-400'}`}>{fmt(data.leads.totalTPV / 12)}</p>
                </div>
                <div className={`text-right rounded-xl px-4 py-3 ${dark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>Est. Annual TPV</p>
                  <p className={`text-2xl font-bold mt-0.5 ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>{fmt(data.leads.totalTPV)}</p>
                </div>
              </div>
            </div>

            {/* Deals */}
            <div className="px-6 py-5 flex items-center justify-between gap-6">
              <div>
                <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>Total Deals in the CRM</p>
                <p className={`text-3xl font-bold mt-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{data.deals.total.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`text-right rounded-xl px-4 py-3 ${dark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>Monthly ARR</p>
                  <p className={`text-xl font-bold mt-0.5 ${dark ? 'text-orange-300' : 'text-orange-400'}`}>{fmt(data.deals.activeARR / 12)}</p>
                </div>
                <div className={`text-right rounded-xl px-4 py-3 ${dark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>Pipeline ARR</p>
                  <p className={`text-2xl font-bold mt-0.5 ${dark ? 'text-orange-400' : 'text-orange-600'}`}>{fmt(data.deals.activeARR)}</p>
                </div>
              </div>
            </div>

            {/* Customers */}
            <div className="px-6 py-5 flex items-center justify-between gap-6">
              <div>
                <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>Total Customers in CRM</p>
                <p className={`text-3xl font-bold mt-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{data.customers.total.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`text-right rounded-xl px-4 py-3 ${dark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>Monthly TPV</p>
                  <p className={`text-xl font-bold mt-0.5 ${dark ? 'text-green-300' : 'text-green-500'}`}>$10M</p>
                </div>
                <div className={`text-right rounded-xl px-4 py-3 ${dark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>Cumulative TPV</p>
                  <p className={`text-2xl font-bold mt-0.5 ${dark ? 'text-green-400' : 'text-green-600'}`}>$120M</p>
                </div>
              </div>
            </div>
          </div>

          {/* Deals by stage */}
          <div>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${dark ? 'text-white/40' : 'text-gray-400'}`}>📊 Deals by Stage</h2>
            <div className="space-y-2">
              {data.deals.byStage.map(({ stage, count, arr }) => {
                const colorClass = STAGE_COLORS[stage] || (dark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500');
                const pct = data.deals.totalARR > 0 ? (arr / data.deals.totalARR) * 100 : 0;
                return (
                  <div key={stage} className={`rounded-xl px-4 py-3 flex items-center gap-3 ${dark ? 'bg-[#1a1a1a]' : 'bg-white border border-gray-100'}`}>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${colorClass}`}>{stage}</span>
                    <div className="flex-1">
                      <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-white/5' : 'bg-gray-100'}`}>
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs font-medium w-8 text-right flex-shrink-0 ${dark ? 'text-white/50' : 'text-gray-500'}`}>{count}</span>
                    <span className={`text-xs w-20 text-right flex-shrink-0 ${dark ? 'text-white/70' : 'text-gray-700'}`}>{fmt(arr)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lead funnel */}
          <div>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${dark ? 'text-white/40' : 'text-gray-400'}`}>🎯 Leads by Stage</h2>
            <div className="space-y-2">
              {data.leads.byStage.map(({ stage, count, tpv }) => (
                <div key={stage} className={`rounded-xl px-4 py-3 flex items-center justify-between ${dark ? 'bg-[#1a1a1a]' : 'bg-white border border-gray-100'}`}>
                  <span className={`text-sm ${dark ? 'text-white/70' : 'text-gray-700'}`}>{stage}</span>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>{fmt(tpv)} TPV</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${dark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customers */}
          <div>
            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${dark ? 'text-white/40' : 'text-gray-400'}`}>✅ Live Customers ({data.customers.total})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.customers.list.map(({ name, stage }) => (
                <div key={name} className={`rounded-xl px-4 py-3 flex items-center justify-between ${dark ? 'bg-[#1a1a1a]' : 'bg-white border border-gray-100'}`}>
                  <span className={`text-sm font-medium ${dark ? 'text-white' : 'text-gray-800'}`}>{name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${dark ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'}`}>{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
