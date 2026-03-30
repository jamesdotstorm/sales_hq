import { NextResponse } from 'next/server';
import leadsData from '@/data/leads.json';

interface Lead {
  id: string;
  name: string;
  industry: string;
  category: string;
  contactedStatus: string;
  stage: string;
  company: string;
  country: string;
  annualTpv: number;
  paymentProvider: string;
  bookingSoftware: string;
}

export async function GET() {
  const leads = leadsData as Lead[];

  const byCategory: Record<string, { count: number; tpv: number }> = {};
  const byStage: Record<string, { count: number; tpv: number }> = {};
  const byContactedStatus: Record<string, { count: number; tpv: number }> = {};
  const withTPV: { name: string; tpv: number; stage: string; industry: string; category: string }[] = [];

  for (const lead of leads) {
    const tpv = lead.annualTpv || 0;
    const category = lead.category || 'Unknown';
    const stage = lead.stage || 'Unknown';
    const contactedStatus = lead.contactedStatus || 'Not Set';

    if (!byCategory[category]) byCategory[category] = { count: 0, tpv: 0 };
    byCategory[category].count++;
    byCategory[category].tpv += tpv;

    if (!byStage[stage]) byStage[stage] = { count: 0, tpv: 0 };
    byStage[stage].count++;
    byStage[stage].tpv += tpv;

    if (!byContactedStatus[contactedStatus]) byContactedStatus[contactedStatus] = { count: 0, tpv: 0 };
    byContactedStatus[contactedStatus].count++;
    byContactedStatus[contactedStatus].tpv += tpv;

    if (tpv > 0) withTPV.push({ name: lead.name, tpv, stage, industry: lead.industry, category });
  }

  const top10 = withTPV.sort((a, b) => b.tpv - a.tpv).slice(0, 10);

  return NextResponse.json({
    total: leads.length,
    top10,
    byIndustry: Object.entries(byCategory).sort((a, b) => b[1].tpv - a[1].tpv).map(([k, v]) => ({ label: k, count: v.count, tpv: v.tpv })),
    byStage: Object.entries(byStage).sort((a, b) => b[1].tpv - a[1].tpv).map(([k, v]) => ({ stage: k, ...v })),
    byContactedStatus: Object.entries(byContactedStatus).sort((a, b) => b[1].count - a[1].count).map(([k, v]) => ({ label: k, count: v.count, tpv: v.tpv })),
  });
}
