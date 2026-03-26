'use client';

import { useState, useEffect } from 'react';

interface CustomersData {
  total: number;
  top10: { name: string; tpv: number; lastMonthTpv: number; stage: string; type: string }[];
  byType: { label: string; count: number }[];
  byStage: { stage: string; count: number; tpv: number }[];
}

interface Props { dark: boolean }

function fmt(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const STAGE_COLORS: Record<string, string> = {
  'Live': 'bg-green-500/20 text-green-400',
  'Onboarding': 'bg-blue-500/20 text-blue-400',
  'Activation': 'bg-cyan-500/20 text-cyan-400',
  'Churned': 'bg-red-500/20 text-red-400',
  'Paused': 'bg-yellow-500/20 text-yellow-400',
};

export default function CustomersView({ dark }: Props) {
  const [data, setData] = useState<CustomersData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/customers-report').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className={`text-center py-20 ${dark ? 'text-white/20' : 'text-gray-300'}`}>
      <div className="text-4xl mb-3 animate-pulse">✅</div><p>Loading customers...</p>
    </div>
  );

  if (!data) return <div className="p-6 text-red-400">Failed to load</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>✅ Customers</h1>
        <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>{data.total.toLocaleString()} customers in CRM</p>
      </div>

      {/* Top 10 by TPV */}
      <div>
        <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? 'text-white/40' : 'text-gray-400'}`}>⭐ Top 10 Customers by Last Month TPV</h2>
        <div className="space-y-2">
          {data.top10.map((c, i) => (
            <div key={c.name} className={`rounded-xl px-4 py-3 flex items-center gap-3 ${dark ? 'bg-[#1a1a1a]' : 'bg-white border border-gray-100 shadow-sm'}`}>
              <span className={`text-sm font-bold w-6 flex-shrink-0 ${dark ? 'text-white/20' : 'text-gray-300'}`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${dark ? 'text-white' : 'text-gray-800'}`}>{c.name}</p>
                <p className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>{c.type}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${STAGE_COLORS[c.stage] || (dark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500')}`}>{c.stage}</span>
              <div className="flex-shrink-0 text-right">
                <p className={`text-sm font-semibold ${dark ? 'text-green-400' : 'text-green-600'}`}>{c.lastMonthTpv > 0 ? fmt(c.lastMonthTpv) : '—'}</p>
                <p className={`text-xs ${dark ? 'text-white/20' : 'text-gray-400'}`}>{c.tpv > 0 ? fmt(c.tpv) + ' total' : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Type */}
        <div>
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? 'text-white/40' : 'text-gray-400'}`}>📋 By Customer Type</h2>
          <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-white/5' : 'border-gray-100'}`}>
            {data.byType.map(({ label, count }) => (
              <div key={label} className={`px-4 py-3 flex items-center justify-between border-b last:border-0 ${dark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-50'}`}>
                <span className={`text-sm ${dark ? 'text-white/70' : 'text-gray-700'}`}>{label}</span>
                <span className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Stage */}
        <div>
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? 'text-white/40' : 'text-gray-400'}`}>🔄 By Customer Stage</h2>
          <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-white/5' : 'border-gray-100'}`}>
            {data.byStage.map(({ stage, count, tpv }) => (
              <div key={stage} className={`px-4 py-3 flex items-center justify-between border-b last:border-0 ${dark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STAGE_COLORS[stage] || (dark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500')}`}>{stage}</span>
                  <span className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>{count}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${dark ? 'text-green-400' : 'text-green-600'}`}>{tpv > 0 ? fmt(tpv) : '—'}</span>
                  <p className={`text-xs ${dark ? 'text-white/20' : 'text-gray-400'}`}>last month</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
