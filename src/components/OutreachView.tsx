'use client';

import { useEffect, useState } from 'react';

type TimeRange = 'today' | 'week' | 'month' | 'all';

interface SequenceStat {
  id: string;
  name: string;
  status: string;
  leadCount: number;
  contactedCount: number;
  openedCount: number;
  openedPercent: number;
  repliedCount: number;
  repliedPercent: number;
  repliedPositiveCount: number;
  repliedNegativeCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
}

interface Summary {
  totalSequences: number;
  activeSequences: number;
  completedSequences: number;
  draftSequences: number;
  totalLeads: number;
  totalContacted: number;
  totalReplied: number;
  totalOpened: number;
  overallReplyRate: string;
  overallOpenRate: string;
  totalMailboxes: number;
}

interface SalesforgeData {
  summary: Summary;
  sequences: SequenceStat[];
  mailboxes: { id: string; address: string; firstName: string }[];
}

interface Props { dark: boolean; }

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/15 text-green-400',
  completed: 'bg-blue-500/15 text-blue-400',
  draft: 'bg-white/5 text-white/30',
};

function StatBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function OutreachView({ dark }: Props) {
  const [data, setData] = useState<SalesforgeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'draft'>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  useEffect(() => {
    fetch('/api/salesforge')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  if (loading) return (
    <div className={`flex items-center justify-center h-64 ${dark ? 'text-white/30' : 'text-gray-400'}`}>
      <div className="text-center">
        <div className="text-3xl mb-2 animate-pulse">📧</div>
        <p className="text-sm">Loading Salesforge data...</p>
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="p-6 text-red-400">Error loading Salesforge: {error}</div>
  );

  const { summary, sequences } = data;
  // Time range: Salesforge API only has all-time stats (no timestamps on sequences).
  // For today/week/month we show only active sequences (currently sending).
  // All time shows everything.
  const timeFiltered = (() => {
    if (timeRange === 'all') return sequences;
    // today / week / month → only active sequences make sense
    return sequences.filter(s => s.status === 'active');
  })();

  const filtered = filter === 'all' ? timeFiltered : timeFiltered.filter(s => s.status === filter);
  const sorted = [...filtered].sort((a, b) => b.contactedCount - a.contactedCount);

  const timeLabel: Record<TimeRange, string> = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    all: 'All Time',
  };
  const isFiltered = timeRange !== 'all';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>📧 Outreach</h1>
            <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>
              Salesforge · {summary.totalMailboxes} mailboxes · live data
            </p>
          </div>
          <button
            onClick={() => { setLoading(true); fetch('/api/salesforge').then(r => r.json()).then(d => { setData(d); setLoading(false); }); }}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${dark ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Time range selector */}
        <div className={`inline-flex rounded-xl p-1 gap-1 ${dark ? 'bg-white/5' : 'bg-gray-100'}`}>
          {([['today', 'Today'], ['week', 'This Week'], ['month', 'This Month'], ['all', 'All Time']] as [TimeRange, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTimeRange(val)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeRange === val
                  ? dark ? 'bg-indigo-600 text-white shadow' : 'bg-white text-indigo-600 shadow-sm'
                  : dark ? 'text-white/40 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {isFiltered && (
          <p className={`text-xs mt-2 ${dark ? 'text-white/25' : 'text-gray-400'}`}>
            Showing active sequences · stats are all-time totals
          </p>
        )}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Leads', value: summary.totalLeads.toLocaleString(), sub: `${summary.activeSequences} active sequences` },
          { label: 'Contacted', value: summary.totalContacted.toLocaleString(), sub: 'emails sent' },
          { label: 'Reply Rate', value: `${summary.overallReplyRate}%`, sub: `${summary.totalReplied} replies`, highlight: parseFloat(summary.overallReplyRate) >= 3 ? 'green' : 'amber' },
          { label: 'Open Rate', value: `${summary.overallOpenRate}%`, sub: `${summary.totalOpened} opens`, highlight: parseFloat(summary.overallOpenRate) >= 30 ? 'green' : undefined },
        ].map(({ label, value, sub, highlight }) => (
          <div key={label} className={`rounded-xl p-4 border ${dark ? 'bg-[#1a1a1a] border-white/5' : 'bg-white border-gray-100 shadow-sm'}`}>
            <p className={`text-xs uppercase tracking-wider mb-1 ${dark ? 'text-white/30' : 'text-gray-400'}`}>{label}</p>
            <p className={`text-xl font-bold ${
              highlight === 'green' ? 'text-green-400' :
              highlight === 'amber' ? 'text-amber-400' :
              dark ? 'text-white' : 'text-gray-900'
            }`}>{value}</p>
            <p className={`text-xs mt-0.5 ${dark ? 'text-white/20' : 'text-gray-400'}`}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {([['all', 'All', summary.totalSequences], ['active', 'Active', summary.activeSequences], ['completed', 'Completed', summary.completedSequences], ['draft', 'Drafts', summary.draftSequences]] as const).map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1.5 ${
              filter === val
                ? 'bg-indigo-600 text-white'
                : dark ? 'bg-white/5 text-white/40 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filter === val ? 'bg-indigo-500' : dark ? 'bg-white/10' : 'bg-gray-200'}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Sequences table */}
      <div className="space-y-3">
        {sorted.map(seq => {
          const hasData = seq.contactedCount > 0;
          return (
            <div
              key={seq.id}
              className={`border rounded-2xl p-4 transition-colors ${
                dark ? 'bg-[#1a1a1a] border-white/5 hover:border-white/10' : 'bg-white border-gray-100 shadow-sm hover:border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-semibold text-sm truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{seq.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[seq.status] || STATUS_COLORS.draft}`}>
                      {seq.status}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${dark ? 'text-white/25' : 'text-gray-400'}`}>
                    {seq.leadCount} leads · {seq.contactedCount} contacted
                    {seq.bouncedCount > 0 && ` · ${seq.bouncedCount} bounced`}
                    {seq.unsubscribedCount > 0 && ` · ${seq.unsubscribedCount} unsub`}
                  </p>
                </div>
              </div>

              {hasData ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Reply rate */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>Replies</span>
                      <span className={`text-xs font-semibold ${
                        seq.repliedPercent >= 5 ? 'text-green-400' :
                        seq.repliedPercent >= 2 ? 'text-amber-400' : 'text-red-400'
                      }`}>{seq.repliedCount} ({seq.repliedPercent.toFixed(1)}%)</span>
                    </div>
                    <StatBar value={seq.repliedCount} total={seq.contactedCount} color="bg-green-500" />
                    {(seq.repliedPositiveCount > 0 || seq.repliedNegativeCount > 0) && (
                      <p className={`text-[10px] mt-1 ${dark ? 'text-white/20' : 'text-gray-400'}`}>
                        👍 {seq.repliedPositiveCount} positive · 👎 {seq.repliedNegativeCount} negative
                      </p>
                    )}
                  </div>

                  {/* Open rate */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>Opens</span>
                      <span className={`text-xs font-semibold ${dark ? 'text-white/60' : 'text-gray-600'}`}>{seq.openedCount} ({seq.openedPercent.toFixed(1)}%)</span>
                    </div>
                    <StatBar value={seq.openedCount} total={seq.contactedCount} color="bg-blue-500" />
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${dark ? 'text-white/30' : 'text-gray-400'}`}>Progress</span>
                      <span className={`text-xs font-semibold ${dark ? 'text-white/60' : 'text-gray-600'}`}>
                        {seq.leadCount > 0 ? Math.round((seq.contactedCount / seq.leadCount) * 100) : 0}%
                      </span>
                    </div>
                    <StatBar value={seq.contactedCount} total={seq.leadCount} color="bg-indigo-500" />
                  </div>
                </div>
              ) : (
                <p className={`text-xs ${dark ? 'text-white/15' : 'text-gray-300'}`}>
                  {seq.status === 'draft' ? 'Not started yet' : seq.leadCount > 0 ? `${seq.leadCount} leads queued` : 'No leads added'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Mailboxes */}
      {data.mailboxes.length > 0 && (
        <div className="mt-8">
          <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? 'text-white/30' : 'text-gray-400'}`}>
            📬 Sending Mailboxes ({data.mailboxes.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.mailboxes.map(m => (
              <div key={m.id} className={`text-xs px-3 py-1.5 rounded-full border ${dark ? 'bg-white/3 border-white/5 text-white/40' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                {m.address}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className={`text-xs mt-6 ${dark ? 'text-white/15' : 'text-gray-300'}`}>
        Data from Salesforge · refreshes every 5 minutes
      </p>
    </div>
  );
}
