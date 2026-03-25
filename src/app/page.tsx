'use client';

import { useState } from 'react';
import DailyQuote from '@/components/DailyQuote';
import SalesReport from '@/components/SalesReport';

type View = 'sales' | 'leads' | 'deals' | 'customers';

const NAV: { id: View; label: string; icon: string }[] = [
  { id: 'sales', label: 'Sales Report', icon: '📊' },
  { id: 'leads', label: 'Leads', icon: '🎯' },
  { id: 'deals', label: 'Deals', icon: '💼' },
  { id: 'customers', label: 'Customers', icon: '✅' },
];

function ComingSoon({ icon, label, desc, dark }: { icon: string; label: string; desc: string; dark: boolean }) {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>{icon} {label}</h1>
      </div>
      <div className={`text-center py-20 ${dark ? 'text-white/20' : 'text-gray-300'}`}>
        <div className="text-5xl mb-3">{icon}</div>
        <p className={`text-lg font-medium ${dark ? 'text-white/40' : 'text-gray-400'}`}>Coming soon</p>
        <p className="text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>('sales');
  const [dark, setDark] = useState(true);

  const toggleDark = () => setDark(d => !d);

  return (
    <div className={`flex h-screen font-sans ${dark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
      {/* Sidebar — hidden on mobile */}
      <div className={`hidden md:flex w-60 border-r flex-col flex-shrink-0 ${dark ? 'bg-[#161616] border-white/5' : 'bg-white border-gray-200'}`}>
        {/* Logo */}
        <div className={`px-5 py-5 border-b ${dark ? 'border-white/5' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <div>
                <p className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>Sales HQ</p>
                <p className={`text-xs ${dark ? 'text-white/40' : 'text-gray-400'}`}>TurnStay</p>
              </div>
            </div>
            <button onClick={toggleDark} className="text-lg opacity-50 hover:opacity-100 transition-opacity">
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Daily Quote */}
        <DailyQuote dark={dark} />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                view === id
                  ? 'bg-indigo-600 text-white'
                  : dark ? 'text-white/50 hover:bg-white/5 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className={`px-5 py-4 border-t ${dark ? 'border-white/5' : 'border-gray-100'}`}>
          <p className={`text-xs ${dark ? 'text-white/20' : 'text-gray-300'}`}>Where deals get done</p>
        </div>
      </div>

      {/* Mobile header */}
      <div className={`fixed top-0 left-0 right-0 flex md:hidden items-center justify-between px-4 py-3 border-b z-40 ${dark ? 'bg-[#161616] border-white/10' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <span className={`font-bold text-sm ${dark ? 'text-white' : 'text-gray-800'}`}>TurnStay Sales HQ</span>
        </div>
        <button onClick={toggleDark} className="text-lg opacity-50 hover:opacity-100">
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Main content */}
      <div className={`flex-1 overflow-auto pb-16 pt-12 md:pt-0 md:pb-0 ${dark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
        {view === 'sales' && <SalesReport dark={dark} />}
        {view === 'leads' && <ComingSoon icon="🎯" label="Leads" desc="Full lead pipeline view coming soon" dark={dark} />}
        {view === 'deals' && <ComingSoon icon="💼" label="Deals" desc="Deal pipeline and stage tracking coming soon" dark={dark} />}
        {view === 'customers' && <ComingSoon icon="✅" label="Customers" desc="Customer health and activity coming soon" dark={dark} />}
      </div>

      {/* Bottom nav — mobile only */}
      <div className={`fixed bottom-0 left-0 right-0 flex md:hidden border-t z-50 ${dark ? 'bg-[#161616] border-white/10' : 'bg-white border-gray-200'}`}>
        {NAV.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors ${view === id ? 'text-indigo-500' : dark ? 'text-white/40' : 'text-gray-400'}`}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
