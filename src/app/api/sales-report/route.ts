import { NextResponse } from 'next/server';

const ATTIO_TOKEN = process.env.ATTIO_API_TOKEN || '';

async function attioQuery(endpoint: string, payload = {}) {
  const res = await fetch(`https://api.attio.com/v2${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ATTIO_TOKEN}`,
      'Content-Type': 'application/json',
    },
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
  const [leads, deals, customers] = await Promise.all([
    fetchAll('/objects/leads/records/query'),
    fetchAll('/objects/deals/records/query'),
    fetchAll('/objects/customers/records/query'),
  ]);

  // LEADS
  let totalTPV = 0;
  const leadsByStage: Record<string, { count: number; tpv: number }> = {};
  const leadsByIndustry: Record<string, { count: number; tpv: number }> = {};
  for (const lead of leads) {
    const vals = lead.values || {};
    const tpv = vals.annual_tpv_est?.[0]?.value || 0;
    totalTPV += tpv;
    const stage = vals.stages?.[0]?.status?.title || 'Unknown';
    if (!leadsByStage[stage]) leadsByStage[stage] = { count: 0, tpv: 0 };
    leadsByStage[stage].count++;
    leadsByStage[stage].tpv += tpv;
    const industry = vals.industry?.[0]?.option?.title || vals.industry?.[0]?.value || 'Untagged';
    if (!leadsByIndustry[industry]) leadsByIndustry[industry] = { count: 0, tpv: 0 };
    leadsByIndustry[industry].count++;
    leadsByIndustry[industry].tpv += tpv;
  }

  // DEALS
  let totalARR = 0;
  let wonARR = 0;
  let wonCount = 0;
  let activeARR = 0;
  let activeDeals = 0;
  const dealsByStage: Record<string, { count: number; arr: number }> = {};
  for (const deal of deals) {
    const vals = deal.values || {};
    const arr = vals.arr?.[0]?.value || 0;
    const stage = vals.stage?.[0]?.status?.title || 'Unknown';
    // Won deals become customers — exclude from active deal counts
    if (stage === 'Won 🎉') { wonARR += arr; wonCount++; continue; }
    totalARR += arr;
    activeDeals++;
    if (!dealsByStage[stage]) dealsByStage[stage] = { count: 0, arr: 0 };
    dealsByStage[stage].count++;
    dealsByStage[stage].arr += arr;
    if (['Hunting', 'Hot Lead', 'Onboarding', 'Activation'].includes(stage)) activeARR += arr;
  }

  // CUSTOMERS
  let lastMonthTPV = 0;
  let totalCumulativeTPV = 0;
  const customersByIndustry: Record<string, { count: number; tpv: number }> = {};
  const customerList = customers.map((c: Record<string, unknown>) => {
    const vals = c.values as Record<string, Array<Record<string, unknown>>> || {};
    const lm = (vals.last_months_tpv?.[0] as Record<string, number>)?.value || 0;
    const cumulative = (vals.cumulative_volume?.[0] as Record<string, number>)?.value || 0;
    lastMonthTPV += lm;
    totalCumulativeTPV += cumulative;
    const industry = (vals.type?.[0] as Record<string, Record<string, string>>)?.option?.title
      || (vals.industry?.[0] as Record<string, Record<string, string>>)?.option?.title
      || (vals.industry?.[0] as Record<string, string>)?.value
      || 'Untagged';
    if (!customersByIndustry[industry]) customersByIndustry[industry] = { count: 0, tpv: 0 };
    customersByIndustry[industry].count++;
    customersByIndustry[industry].tpv += cumulative;
    return {
      name: (vals.merchant_name?.[0] as Record<string, string>)?.value || 'Unknown',
      stage: (vals.stage?.[0] as Record<string, Record<string, string>>)?.status?.title || 'Unknown',
      industry,
    };
  });

  // MARKET PENETRATION — merge leads + customers by industry
  const allIndustries = new Set([...Object.keys(leadsByIndustry), ...Object.keys(customersByIndustry)]);
  const marketPenetration = Array.from(allIndustries).map(industry => {
    const targets = leadsByIndustry[industry] || { count: 0, tpv: 0 };
    const cust = customersByIndustry[industry] || { count: 0, tpv: 0 };
    const clientCount = cust.count;
    const targetCount = targets.count;
    const total = targetCount + clientCount;
    const convRate = total > 0 ? (clientCount / total) * 100 : 0;
    return {
      industry,
      targets: targetCount,
      clients: clientCount,
      conversionRate: Math.round(convRate * 10) / 10,
      estMarketTPV: targets.tpv, // annual TPV estimate of targets
      customerTPV: cust.tpv,     // cumulative TPV from customers in this industry
    };
  }).sort((a, b) => b.estMarketTPV - a.estMarketTPV);

  return NextResponse.json({
    leads: {
      total: leads.length,
      totalTPV,
      byStage: Object.entries(leadsByStage)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8)
        .map(([stage, data]) => ({ stage, ...data })),
    },
    deals: {
      total: activeDeals,
      totalARR,
      wonARR,
      wonCount,
      activeARR,
      byStage: Object.entries(dealsByStage)
        .sort((a, b) => b[1].arr - a[1].arr)
        .map(([stage, data]) => ({ stage, ...data })),
    },
    customers: {
      total: customers.length,
      lastMonthTPV,
      annualisedTPV: lastMonthTPV * 12,
      totalCumulativeTPV,
      list: customerList,
    },
    marketPenetration,
    generatedAt: new Date().toISOString(),
  });
}
