'use client';

import { useState, useEffect } from 'react';

interface Row { label: string; count: number; tpv: number }
interface StageRow { stage: string; count: number; tpv: number }
interface LeadsData {
  total: number;
  byIndustry: Row[];
  byStage: StageRow[];
  byContactedStatus: Row[];
}

interface Props { dark: boolean }

function fmt(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function BreakdownTable({ title, rows, totalTPV, dark }: {
  title: string;
  rows: { label: string; count: number; tpv: number }[];
  totalTPV: number;
  dark: boolean;
}) {
  const known = rows.filter(r => r.label !== 'Unknown' && r.label !== 'Not Set');
  const unknown = rows.filter(r => r.label === 'Unknown' || r.label === 'Not Set');
  const all = [...known, ...unknown];

  return (
    <div>
      <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? 'text-white/40' : 'text-gray-400'}`}>{title}</h2>
      <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-white/5' : 'border-gray-100'}`}>
        <div className={`grid grid-cols-3 px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b ${dark ? 'bg-white/3 border-white/5 text-white/30' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
          <span>Name</span>
          <span className="text-center">Count</span>
          <span className="text-right">Est. Annual TPV</span>
        </div>
        {all.map(({ label, count, tpv }) => {
          const pct = totalTPV > 0 ? (tpv / totalTPV) * 100 : 0;
          const isUnknown = label === 'Unknown' || label === 'Not Set';
          return (
            <div key={label} className={`px-4 py-3 border-b last:border-0 ${dark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-50'}`}>
              <div className="grid grid-cols-3 items-center mb-1.5">
                <span className={`text-sm font-medium ${isUnknown ? (dark ? 'text-white/25' : 'text-gray-300') : (dark ? 'text-white' : 'text-gray-800')}`}>{label}</span>
                <span className={`text-sm text-center ${isUnknown ? (dark ? 'text-white/25' : 'text-gray-300') : (dark ? 'text-white/60' : 'text-gray-500')}`}>{count.toLocaleString()}</span>
                <span className={`text-sm font-semibold text-right ${isUnknown ? (dark ? 'text-white/25' : 'text-gray-300') : (dark ? 'text-indigo-400' : 'text-indigo-600')}`}>{fmt(tpv)}</span>
              </div>
              {!isUnknown && (
                <div className={`h-1 rounded-full overflow-hidden ${dark ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function LeadsView({ dark }: Props) {
  const [data, setData] = useState<LeadsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leads-report')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalTPV = data?.byIndustry.reduce((s, r) => s + r.tpv, 0) || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>🎯 Targets</h1>
        {data && <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>{data.total.toLocaleString()} total targets · {fmt(totalTPV)} est. annual TPV</p>}
      </div>

      {loading && (
        <div className={`text-center py-20 ${dark ? 'text-white/20' : 'text-gray-300'}`}>
          <div className="text-4xl mb-3 animate-pulse">🎯</div>
          <p>Loading targets...</p>
        </div>
      )}

      {data && (
        <>
          <BreakdownTable
            title="By Company Type"
            rows={data.byIndustry}
            totalTPV={totalTPV}
            dark={dark}
          />
          <BreakdownTable
            title="By Stage"
            rows={data.byStage.map(r => ({ label: r.stage, count: r.count, tpv: r.tpv }))}
            totalTPV={totalTPV}
            dark={dark}
          />
          <BreakdownTable
            title="By Contacted Status"
            rows={data.byContactedStatus}
            totalTPV={totalTPV}
            dark={dark}
          />
        </>
      )}
    </div>
  );
}
