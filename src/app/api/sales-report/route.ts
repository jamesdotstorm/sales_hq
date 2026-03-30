import { NextResponse } from 'next/server';
import leadsData from '@/data/leads.json';
import dealsData from '@/data/deals.json';
import clientsData from '@/data/clients.json';

interface Lead {
  id: string; name: string; industry: string; category: string;
  contactedStatus: string; stage: string; company: string;
  country: string; annualTpv: number; paymentProvider: string; bookingSoftware: string;
}
interface Deal {
  id: string; name: string; stage: string; type: string; category: string;
  campaign: string; dealOwner: string; status: string; huntingStatus: string;
  leadMilestone: string; arr: number; dealValue: number;
}
interface Client {
  id: string; name: string; status: string; stage: string; category: string;
  accountManager: string; lastMonthTpv: number; monthlyAvgTpv: number;
  cumulativeTpv: number; accountName: string; type: string;
}

export async function GET() {
  const leads = leadsData as Lead[];
  const deals = dealsData as Deal[];
  const clients = clientsData as Client[];

  // LEADS
  let totalTPV = 0;
  const leadsByStage: Record<string, { count: number; tpv: number }> = {};
  const leadsByCategory: Record<string, { count: number; tpv: number }> = {};
  for (const lead of leads) {
    const tpv = lead.annualTpv || 0;
    totalTPV += tpv;
    const stage = lead.stage || 'Unknown';
    const category = lead.category || 'Unknown';
    if (!leadsByStage[stage]) leadsByStage[stage] = { count: 0, tpv: 0 };
    leadsByStage[stage].count++;
    leadsByStage[stage].tpv += tpv;
    if (!leadsByCategory[category]) leadsByCategory[category] = { count: 0, tpv: 0 };
    leadsByCategory[category].count++;
    leadsByCategory[category].tpv += tpv;
  }

  // DEALS
  let totalARR = 0;
  let wonARR = 0;
  let wonCount = 0;
  let activeARR = 0;
  let activeDeals = 0;
  const dealsByStage: Record<string, { count: number; arr: number }> = {};
  for (const deal of deals) {
    const arr = deal.arr || 0;
    const stage = deal.stage || 'Unknown';
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
  const customersByCategory: Record<string, { count: number; tpv: number }> = {};
  const customerList = clients.map(c => {
    const lm = c.lastMonthTpv || 0;
    const cumulative = c.cumulativeTpv || 0;
    lastMonthTPV += lm;
    totalCumulativeTPV += cumulative;
    const category = c.category || 'Unknown';
    if (!customersByCategory[category]) customersByCategory[category] = { count: 0, tpv: 0 };
    customersByCategory[category].count++;
    customersByCategory[category].tpv += cumulative;
    return { name: c.name, stage: c.stage, category };
  });

  // MARKET PENETRATION — merge leads + customers by category
  const allCategories = new Set([...Object.keys(leadsByCategory), ...Object.keys(customersByCategory)]);
  const marketPenetration = Array.from(allCategories).map(category => {
    const targets = leadsByCategory[category] || { count: 0, tpv: 0 };
    const cust = customersByCategory[category] || { count: 0, tpv: 0 };
    const total = targets.count + cust.count;
    const convRate = total > 0 ? (cust.count / total) * 100 : 0;
    return {
      industry: category,
      targets: targets.count,
      clients: cust.count,
      conversionRate: Math.round(convRate * 10) / 10,
      estMarketTPV: targets.tpv,
      customerTPV: cust.tpv,
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
      total: clients.length,
      lastMonthTPV,
      annualisedTPV: lastMonthTPV * 12,
      totalCumulativeTPV,
      list: customerList,
    },
    marketPenetration,
    generatedAt: new Date().toISOString(),
  });
}
