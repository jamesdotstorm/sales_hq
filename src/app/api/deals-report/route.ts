import { NextResponse } from 'next/server';
import dealsData from '@/data/deals.json';

interface Deal {
  id: string;
  name: string;
  stage: string;
  type: string;
  category: string;
  campaign: string;
  dealOwner: string;
  status: string;
  huntingStatus: string;
  leadMilestone: string;
  arr: number;
  dealValue: number;
}

export async function GET() {
  const deals = dealsData as Deal[];

  const byCategory: Record<string, { count: number; arr: number }> = {};
  const byStage: Record<string, { count: number; arr: number }> = {};
  const active: { name: string; arr: number; stage: string; category: string }[] = [];

  for (const deal of deals) {
    if (deal.stage === 'Won 🎉') continue;

    const category = deal.category || 'Unknown';
    const stage = deal.stage || 'Unknown';
    const arr = deal.arr || 0;

    if (!byCategory[category]) byCategory[category] = { count: 0, arr: 0 };
    byCategory[category].count++;
    byCategory[category].arr += arr;

    if (!byStage[stage]) byStage[stage] = { count: 0, arr: 0 };
    byStage[stage].count++;
    byStage[stage].arr += arr;

    active.push({ name: deal.name, arr, stage, category });
  }

  const top10 = active.sort((a, b) => b.arr - a.arr).slice(0, 10);

  return NextResponse.json({
    total: active.length,
    top10,
    byType: Object.entries(byCategory).sort((a, b) => b[1].count - a[1].count).map(([k, v]) => ({ label: k, count: v.count, arr: v.arr })),
    byStage: Object.entries(byStage).sort((a, b) => b[1].arr - a[1].arr).map(([k, v]) => ({ stage: k, ...v })),
  });
}
