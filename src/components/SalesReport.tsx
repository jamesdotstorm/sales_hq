'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
    lastMonthTPV: number;
    annualisedTPV: number;
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

const CONVERSION_KEY = 'salesHQ_conversionRates';

function loadRates() {
  try {
    const saved = localStorage.getItem(CONVERSION_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { targetToCustomer: '', dealToCustomer: '' };
}

export default function SalesReport({ dark }: Props) {
  const [data, setData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rates, setRates] = useState<{ targetToCustomer: string; dealToCustomer: string }>({ targetToCustomer: '', dealToCustomer: '' });
  const [editing, setEditing] = useState<'targetToCustomer' | 'dealToCustomer' | null>(null);
  const [draft, setDraft] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    fetch('/api/sales-report')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load data'); setLoading(false); });
  };

  useEffect(() => { load(); setRates(loadRates()); }, []);

  const saveRate = (key: 'targetToCustomer' | 'dealToCustomer', value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const updated = { ...rates, [key]: cleaned };
    setRates(updated);
    localStorage.setItem(CONVERSION_KEY, JSON.stringify(updated));
    setEditing(null);
  };

  const startEdit = (key: 'targetToCustomer' | 'dealToCustomer') => {
    setDraft(rates[key]);
    setEditing(key);
  };

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
                <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>Last Month TPV</p>
                <p className={`text-2xl font-bold mt-0.5 ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>{fmt(data.customers.lastMonthTPV)}</p>
                <p className={`text-xs mt-0.5 ${dark ? 'text-white/20' : 'text-gray-400'}`}>from {data.customers.total} customers</p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>Annualised TPV (× 12)</p>
                <p className={`text-3xl font-bold mt-1 ${dark ? 'text-white' : 'text-gray-900'}`}>{fmt(data.customers.annualisedTPV)}</p>
              </div>
            </div>
          </div>

          {/* Summary + Conversion Rates — one card */}
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
                  <p className={`text-xl font-bold mt-0.5 ${dark ? 'text-green-300' : 'text-green-500'}`}>{fmt(data.customers.lastMonthTPV)}</p>
                </div>
                <div className={`text-right rounded-xl px-4 py-3 ${dark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>Annualised TPV</p>
                  <p className={`text-2xl font-bold mt-0.5 ${dark ? 'text-green-400' : 'text-green-600'}`}>{fmt(data.customers.annualisedTPV)}</p>
                </div>
              </div>
            </div>

            {/* Conversion Rates */}
            {([
              { key: 'targetToCustomer' as const, label: 'Target to Customer Monthly Conversion Rate', color: dark ? 'text-indigo-400' : 'text-indigo-600' },
              { key: 'dealToCustomer' as const, label: 'Deal to Customer Monthly Conversion Rate', color: dark ? 'text-orange-400' : 'text-orange-600' },
            ]).map(({ key, label, color }) => (
              <div key={key} className="px-6 py-5 flex items-center justify-between gap-6">
                <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>{label}</p>
                {editing === key ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      autoFocus
                      type="text"
                      inputMode="decimal"
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveRate(key, draft); if (e.key === 'Escape') setEditing(null); }}
                      className={`w-24 text-right text-lg font-bold rounded-lg px-3 py-1.5 border outline-none ${dark ? 'bg-white/10 border-indigo-400 text-white' : 'bg-indigo-50 border-indigo-300 text-gray-900'}`}
                      placeholder="0.0"
                    />
                    <span className={`text-lg font-bold ${color}`}>%</span>
                    <button onClick={() => saveRate(key, draft)} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">Save</button>
                    <button onClick={() => setEditing(null)} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${dark ? 'border-white/10 text-white/40 hover:text-white' : 'border-gray-200 text-gray-400 hover:text-gray-700'}`}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => startEdit(key)} className="flex items-center gap-1.5 flex-shrink-0 group">
                    <span className={`text-2xl font-bold ${rates[key] ? color : (dark ? 'text-white/20' : 'text-gray-300')}`}>
                      {rates[key] ? `${rates[key]}%` : '—'}
                    </span>
                    <span className={`text-xs opacity-0 group-hover:opacity-100 transition-opacity ${dark ? 'text-white/30' : 'text-gray-400'}`}>✏️</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 12-Month TPV Projection */}
          {(() => {
            const targetRate = parseFloat(rates.targetToCustomer) / 100 || 0;
            const dealRate = parseFloat(rates.dealToCustomer) / 100 || 0;
            const targetTPV = 3_800_000_000; // $3.8B total target TPV
            const monthlyGrowth = (targetTPV * targetRate) + (data.deals.activeARR * dealRate);
            const points = [];
            let tpv = 10_000_000;
            for (let m = 0; m <= 12; m++) {
              points.push({ month: m === 0 ? 'Now' : `M${m}`, tpv: Math.round(tpv / 1_000_000 * 10) / 10 });
              tpv += monthlyGrowth;
            }
            const finalTPV = points[12].tpv;
            const reachTarget = finalTPV >= 100;

            return (
              <div className={`rounded-2xl border px-6 py-5 ${dark ? 'bg-[#1a1a1a] border-white/8' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>12-Month TPV Projection</p>
                    <p className={`text-sm ${dark ? 'text-white/50' : 'text-gray-500'}`}>
                      Starting $10M · +{fmt(monthlyGrowth)}/mo growth
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>Month 12</p>
                    <p className={`text-2xl font-bold mt-0.5 ${reachTarget ? (dark ? 'text-green-400' : 'text-green-600') : (dark ? 'text-orange-400' : 'text-orange-600')}`}>
                      ${finalTPV}M
                    </p>
                    <p className={`text-xs mt-0.5 ${reachTarget ? (dark ? 'text-green-400/60' : 'text-green-500') : (dark ? 'text-orange-400/60' : 'text-orange-500')}`}>
                      {reachTarget ? '✅ hits $100M target' : '⚠️ below $100M target'}
                    </p>
                  </div>
                </div>

                {monthlyGrowth === 0 ? (
                  <p className={`text-center py-8 text-sm ${dark ? 'text-white/20' : 'text-gray-300'}`}>Set conversion rates above to see projection</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: dark ? 'rgba(255,255,255,0.3)' : '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={v => `$${v}M`} tick={{ fontSize: 11, fill: dark ? 'rgba(255,255,255,0.3)' : '#9ca3af' }} axisLine={false} tickLine={false} width={55} />
                      <Tooltip
                        formatter={(v) => [`$${v}M`, 'Monthly TPV']}
                        contentStyle={{ background: dark ? '#1a1a1a' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`, borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: dark ? 'rgba(255,255,255,0.5)' : '#6b7280' }}
                        itemStyle={{ color: dark ? '#818cf8' : '#4f46e5' }}
                      />
                      <Line type="monotone" dataKey="tpv" stroke={reachTarget ? '#34d399' : '#f97316'} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                      {/* $100M target line */}
                      <Line type="monotone" data={points.map(p => ({ ...p, target: 100 }))} dataKey="target" stroke={dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} strokeWidth={1} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            );
          })()}

        </div>
      )}
    </div>
  );
}
