'use client';

import { useState, useEffect } from 'react';

interface Category {
  name: string;
  marketSize: number;
  cagr: number;
  projectedSize2029: number | null;
  source: string;
  sourceUrl: string;
  notes: string;
  examples: string;
  excludes: string | null;
}

interface TopStats {
  africaInternationalReceipts: { value: number; source: string; url: string };
  internationalArrivals: { value: number; source: string; url: string };
  crossBorderPayments: { value: number; source: string; url: string };
  crossBorderPayments2035: { value: number; source: string; url: string };
  turnstayTam: { value: number; source: string; url: string | null };
  typicalMdr: { value: string; source: string; url: string | null };
  turnstayRate: { value: string; source: string; url: string | null };
}

interface MarketData {
  categories: Category[];
  totalMarket: number;
  topStats: TopStats;
}

interface Props { dark: boolean }

function fmt(n: number) {
  if (n >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(1)}T`;
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtNum(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString();
}

const CAT_COLORS: Record<string, string> = {
  "Hotels & Accommodation": "bg-blue-500",
  "Safari & Game Reserves": "bg-green-500",
  "Tour Operators / DMCs": "bg-yellow-500",
  "Travel Agents / OTAs": "bg-orange-500",
  "Airlines (regional/charter)": "bg-purple-500",
  "Car Rental": "bg-pink-500",
  "Adventure & Activities": "bg-amber-500",
  "PMS / Booking Software": "bg-cyan-500",
  "Cruise & Marine": "bg-teal-500",
};

export default function MarketResearchView({ dark }: Props) {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/market-research').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className={`text-center py-20 ${dark ? 'text-white/20' : 'text-gray-300'}`}>
      <div className="text-4xl mb-3 animate-pulse">🌍</div><p>Loading market data...</p>
    </div>
  );

  if (!data) return <div className="p-6 text-red-400">Failed to load</div>;

  const totalForBar = data.categories.reduce((s, c) => s + c.marketSize, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>🌍 Africa Travel Market Research</h1>
        <p className={`text-sm mt-1 ${dark ? 'text-white/40' : 'text-gray-400'}`}>
          TurnStay TAM analysis — researched March 2026 by Torti 🐢
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Africa Tourism Receipts", value: fmt(data.topStats.africaInternationalReceipts.value), sub: "per year", source: data.topStats.africaInternationalReceipts.source },
          { label: "International Arrivals", value: `${fmtNum(data.topStats.internationalArrivals.value)}`, sub: "visitors in 2024", source: data.topStats.internationalArrivals.source },
          { label: "TurnStay TAM", value: fmt(data.topStats.turnstayTam.value), sub: "card-eligible spend", source: data.topStats.turnstayTam.source },
          { label: "Cross-Border Payments", value: fmt(data.topStats.crossBorderPayments.value), sub: "→ $1T by 2035", source: data.topStats.crossBorderPayments.source },
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl p-4 ${dark ? 'bg-[#1a1a1a]' : 'bg-white border border-gray-100 shadow-sm'}`}>
            <p className={`text-xs uppercase tracking-wider mb-1 ${dark ? 'text-white/30' : 'text-gray-400'}`}>{stat.label}</p>
            <p className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
            <p className={`text-xs mt-0.5 ${dark ? 'text-white/30' : 'text-gray-400'}`}>{stat.sub}</p>
            <p className={`text-xs mt-2 italic ${dark ? 'text-white/20' : 'text-gray-300'}`}>{stat.source}</p>
          </div>
        ))}
      </div>

      {/* TPV by Category — main table */}
      <div>
        <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? 'text-white/40' : 'text-gray-400'}`}>📊 Market Size by Category</h2>
        <div className={`rounded-2xl border overflow-hidden ${dark ? 'border-white/5' : 'border-gray-100'}`}>
          <div className={`grid grid-cols-12 px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b ${dark ? 'bg-white/3 border-white/5 text-white/30' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
            <span className="col-span-4">Category</span>
            <span className="col-span-2 text-right">Market Size</span>
            <span className="col-span-2 text-center">CAGR</span>
            <span className="col-span-4 text-right hidden md:block">% of Vertical Total</span>
          </div>
          {data.categories.sort((a, b) => b.marketSize - a.marketSize).map(cat => {
            const pct = (cat.marketSize / totalForBar) * 100;
            const isOpen = expanded === cat.name;
            return (
              <div key={cat.name} className={`border-b last:border-0 ${dark ? 'border-white/5' : 'border-gray-50'}`}>
                <button
                  onClick={() => setExpanded(isOpen ? null : cat.name)}
                  className={`w-full grid grid-cols-12 px-4 py-3 items-center text-left hover:opacity-80 transition-opacity ${dark ? 'bg-[#1a1a1a]' : 'bg-white'}`}
                >
                  <div className="col-span-4 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${CAT_COLORS[cat.name] || 'bg-gray-400'}`} />
                    <span className={`text-sm font-medium ${dark ? 'text-white' : 'text-gray-800'}`}>{cat.name}</span>
                  </div>
                  <span className={`col-span-2 text-sm font-semibold text-right ${dark ? 'text-indigo-400' : 'text-indigo-600'}`}>{fmt(cat.marketSize)}</span>
                  <span className={`col-span-2 text-sm text-center ${dark ? 'text-green-400' : 'text-green-600'}`}>{cat.cagr}%</span>
                  <div className="col-span-4 hidden md:flex items-center gap-2 justify-end">
                    <div className={`h-1.5 rounded-full flex-1 max-w-24 overflow-hidden ${dark ? 'bg-white/5' : 'bg-gray-100'}`}>
                      <div className={`h-full rounded-full ${CAT_COLORS[cat.name] || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className={`text-xs w-10 text-right ${dark ? 'text-white/30' : 'text-gray-400'}`}>{pct.toFixed(0)}%</span>
                  </div>
                </button>
                {isOpen && (
                  <div className={`px-6 py-4 border-t ${dark ? 'bg-[#141414] border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className={`text-xs uppercase tracking-wider mb-1 ${dark ? 'text-white/30' : 'text-gray-400'}`}>Examples</p>
                        <p className={dark ? 'text-white/70' : 'text-gray-600'}>{cat.examples}</p>
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-wider mb-1 ${dark ? 'text-white/30' : 'text-gray-400'}`}>TurnStay Notes</p>
                        <p className={dark ? 'text-white/70' : 'text-gray-600'}>{cat.notes}</p>
                      </div>
                      {cat.excludes && (
                        <div>
                          <p className={`text-xs uppercase tracking-wider mb-1 ${dark ? 'text-white/30' : 'text-gray-400'}`}>Excludes</p>
                          <p className={`text-xs ${dark ? 'text-yellow-400/70' : 'text-yellow-600'}`}>⚠️ {cat.excludes}</p>
                        </div>
                      )}
                      <div>
                        <p className={`text-xs uppercase tracking-wider mb-1 ${dark ? 'text-white/30' : 'text-gray-400'}`}>Source</p>
                        {cat.sourceUrl ? (
                          <a href={cat.sourceUrl} target="_blank" rel="noopener noreferrer" className={`text-xs underline ${dark ? 'text-blue-400' : 'text-blue-500'}`}>{cat.source}</a>
                        ) : (
                          <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>{cat.source}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {/* Totals row */}
          <div className={`grid grid-cols-12 px-4 py-3 items-center border-t ${dark ? 'bg-white/3 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
            <span className={`col-span-4 text-sm font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Total Addressable Market</span>
            <span className={`col-span-2 text-sm font-bold text-right ${dark ? 'text-white' : 'text-gray-800'}`}>{fmt(totalForBar)}</span>
            <span className="col-span-6" />
          </div>
        </div>
        <p className={`text-xs mt-2 ${dark ? 'text-white/20' : 'text-gray-400'}`}>
          ✅ Categories are mutually exclusive — no double counting. Click any row to see what is excluded.
        </p>
      </div>

      {/* Payment context */}
      <div>
        <h2 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? 'text-white/40' : 'text-gray-400'}`}>💳 Payment Processing Context</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Typical Africa MDR", value: data.topStats.typicalMdr.value, sub: "international card", color: "text-red-400", source: data.topStats.typicalMdr.source },
            { label: "TurnStay Rate", value: data.topStats.turnstayRate.value, sub: "effective blended", color: "text-green-400", source: data.topStats.turnstayRate.source },
            { label: "OTA Commission", value: "15–25%", sub: "Booking.com / Expedia", color: "text-orange-400", source: "Industry benchmark" },
          ].map(item => (
            <div key={item.label} className={`rounded-xl p-4 ${dark ? 'bg-[#1a1a1a]' : 'bg-white border border-gray-100 shadow-sm'}`}>
              <p className={`text-xs uppercase tracking-wider mb-1 ${dark ? 'text-white/30' : 'text-gray-400'}`}>{item.label}</p>
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className={`text-xs mt-0.5 ${dark ? 'text-white/30' : 'text-gray-400'}`}>{item.sub}</p>
              <p className={`text-xs mt-2 italic ${dark ? 'text-white/20' : 'text-gray-300'}`}>{item.source}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sources footer */}
      <div className={`rounded-xl p-4 text-xs space-y-1 ${dark ? 'bg-white/3 text-white/30' : 'bg-gray-50 text-gray-400'}`}>
        <p className="font-semibold mb-2">📎 All Sources</p>
        {[
          { text: "UN Tourism — Africa Tourism Receipts 2024", url: "https://www.untourism.int/investment/tourism-investment-trends-and-opportunities-in-africa" },
          { text: "UNWTO — International Arrivals Africa 2024", url: "https://www.unwto.org" },
          { text: "Grand View Research — Africa Safari Tourism Market 2023/2024", url: "https://www.grandviewresearch.com/industry-analysis/africa-safari-tourism-market-report" },
          { text: "Hotel Management Network — Africa Hotel Revenue 2024", url: "https://www.hotelmanagement.net" },
          { text: "Statista — Africa Car Rental Market 2024", url: "https://www.statista.com/outlook/mmo/shared-mobility/car-rentals-ride-hailing/car-rentals/africa" },
          { text: "AFRAA — Africa Airline Revenue 2024", url: "https://afraa.org" },
          { text: "Verified Market Research — Global DMC Market 2024", url: "https://www.verifiedmarketresearch.com" },
          { text: "Grand View Research — Global PMS Market 2025", url: "https://www.grandviewresearch.com/industry-analysis/property-management-system-market" },
          { text: "EcoFin Agency — Africa Cross-Border Payments 2025", url: "https://www.ecofinagency.com" },
          { text: "Cruise Lines International Association — Africa Cruise Market 2024", url: "https://cruising.org" },
          { text: "Namibia Tourism Board — Adventure Tourism 2024", url: "https://www.namibiatourism.com.na" },
        ].map(src => (
          <p key={src.text}>• <a href={src.url} target="_blank" rel="noopener noreferrer" className={`underline hover:opacity-80 ${dark ? 'text-blue-400/60' : 'text-blue-500'}`}>{src.text}</a></p>
        ))}
        <p className="mt-3 italic">Research conducted March 2026 by Torti 🐢 — stored in Obsidian: Projects/TurnStay/TurnStay Sales Dashboard — Spec.md</p>
      </div>
    </div>
  );
}
