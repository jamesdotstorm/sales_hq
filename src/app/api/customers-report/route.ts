import { NextResponse } from 'next/server';
import clientsData from '@/data/clients.json';

interface Client {
  id: string;
  name: string;
  status: string;
  stage: string;
  category: string;
  accountManager: string;
  lastMonthTpv: number;
  monthlyAvgTpv: number;
  cumulativeTpv: number;
  accountName: string;
  type: string;
}

export async function GET() {
  const clients = clientsData as Client[];

  const byCategory: Record<string, number> = {};
  const byStage: Record<string, { count: number; tpv: number }> = {};
  const withTPV: { name: string; tpv: number; lastMonthTpv: number; stage: string; category: string }[] = [];

  for (const c of clients) {
    const category = c.category || 'Unknown';
    const stage = c.stage || 'Unknown';
    const tpv = c.cumulativeTpv || 0;
    const lastMonthTpv = c.lastMonthTpv || 0;

    byCategory[category] = (byCategory[category] || 0) + 1;

    if (!byStage[stage]) byStage[stage] = { count: 0, tpv: 0 };
    byStage[stage].count++;
    byStage[stage].tpv += lastMonthTpv;

    withTPV.push({ name: c.name, tpv, lastMonthTpv, stage, category });
  }

  const top10 = withTPV.sort((a, b) => b.lastMonthTpv - a.lastMonthTpv).slice(0, 10);

  return NextResponse.json({
    total: clients.length,
    top10,
    byType: Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, count: v })),
    byStage: Object.entries(byStage).sort((a, b) => b[1].count - a[1].count).map(([k, v]) => ({ stage: k, ...v })),
  });
}
