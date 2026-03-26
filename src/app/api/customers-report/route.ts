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
  const customers = await fetchAll('/objects/customers/records/query');

  const byType: Record<string, number> = {};
  const byStage: Record<string, { count: number; tpv: number }> = {};
  const withTPV: { name: string; tpv: number; stage: string; type: string }[] = [];

  for (const c of customers) {
    const vals = c.values || {};
    const name = vals.merchant_name?.[0]?.value || vals.name?.[0]?.value || 'Unknown';
    const tpv = vals.annual_tpv_est?.[0]?.value || vals.tpv?.[0]?.value || 0;
    const stage = vals.stage?.[0]?.status?.title || 'Unknown';
    const type = vals.type?.[0]?.option?.title || vals.industry?.[0]?.option?.title || vals.industry?.[0]?.value || 'Unknown';

    byType[type] = (byType[type] || 0) + 1;

    if (!byStage[stage]) byStage[stage] = { count: 0, tpv: 0 };
    byStage[stage].count++;
    byStage[stage].tpv += tpv;

    withTPV.push({ name, tpv, stage, type });
  }

  const top10 = withTPV.sort((a, b) => b.tpv - a.tpv).slice(0, 10);

  return NextResponse.json({
    total: customers.length,
    top10,
    byType: Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, count: v })),
    byStage: Object.entries(byStage).sort((a, b) => b[1].count - a[1].count).map(([k, v]) => ({ stage: k, ...v })),
  });
}
