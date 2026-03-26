import { NextResponse } from 'next/server';

const ATTIO_TOKEN = process.env.ATTIO_API_TOKEN || '';

async function attioQuery(endpoint: string, payload = {}) {
  const res = await fetch(`https://api.attio.com/v2${endpoint}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${ATTIO_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

async function fetchAll(endpoint: string) {
  const all = [];
  let offset = 0;
  while (true) {
    const r = await attioQuery(endpoint, { limit: 500, offset });
    const batch = r.data || [];
    all.push(...batch);
    if (batch.length < 500) break;
    offset += 500;
  }
  return all;
}

export async function GET() {
  const deals = await fetchAll('/objects/deals/records/query');

  const byType: Record<string, number> = {};
  const byStage: Record<string, { count: number; arr: number }> = {};
  const active: { name: string; arr: number; stage: string; type: string }[] = [];

  for (const deal of deals) {
    const vals = deal.values || {};
    const name = vals.name?.[0]?.value || 'Unknown';
    const arr = vals.arr?.[0]?.value || 0;
    const stage = vals.stage?.[0]?.status?.title || 'Unknown';
    const type = vals.type?.[0]?.option?.title || vals.type?.[0]?.value || 'Unknown';

    if (stage === 'Won 🎉') continue; // Won = customers now

    byType[type] = (byType[type] || 0) + 1;

    if (!byStage[stage]) byStage[stage] = { count: 0, arr: 0 };
    byStage[stage].count++;
    byStage[stage].arr += arr;

    active.push({ name, arr, stage, type });
  }

  const top10 = active.sort((a, b) => b.arr - a.arr).slice(0, 10);

  return NextResponse.json({
    total: active.length,
    top10,
    byType: Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, count: v })),
    byStage: Object.entries(byStage).sort((a, b) => b[1].arr - a[1].arr).map(([k, v]) => ({ stage: k, ...v })),
  });
}
