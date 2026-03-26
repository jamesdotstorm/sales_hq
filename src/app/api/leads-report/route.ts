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
  // Fetch leads and companies in parallel
  const [leads, companies] = await Promise.all([
    fetchAll('/objects/leads/records/query'),
    fetchAll('/objects/companies/records/query'),
  ]);

  // Build company ID → type map
  const companyTypeMap: Record<string, string> = {};
  for (const c of companies) {
    const id = c.id?.record_id;
    const type = c.values?.type?.[0]?.option?.title || '';
    if (id && type) companyTypeMap[id] = type;
  }

  const byCompanyType: Record<string, { count: number; tpv: number }> = {};
  const byStage: Record<string, { count: number; tpv: number }> = {};
  const withTPV: { name: string; tpv: number; stage: string; industry: string }[] = [];

  for (const lead of leads) {
    const vals = lead.values || {};
    const name = vals.lead_name?.[0]?.value || 'Unknown';
    const tpv = vals.annual_tpv_est?.[0]?.value || 0;
    const stage = vals.stages?.[0]?.status?.title || 'Unknown';

    // Get company type from the linked company record
    const companyId = vals.company?.[0]?.target_record_id;
    const companyType = (companyId && companyTypeMap[companyId]) || 'Unknown';

    // by company type
    if (!byCompanyType[companyType]) byCompanyType[companyType] = { count: 0, tpv: 0 };
    byCompanyType[companyType].count++;
    byCompanyType[companyType].tpv += tpv;

    // by stage
    if (!byStage[stage]) byStage[stage] = { count: 0, tpv: 0 };
    byStage[stage].count++;
    byStage[stage].tpv += tpv;

    if (tpv > 0) withTPV.push({ name, tpv, stage, industry: companyType });
  }

  const top10 = withTPV.sort((a, b) => b.tpv - a.tpv).slice(0, 10);

  return NextResponse.json({
    total: leads.length,
    top10,
    byIndustry: Object.entries(byCompanyType).sort((a, b) => b[1].tpv - a[1].tpv).map(([k, v]) => ({ label: k, count: v.count, tpv: v.tpv })),
    byStage: Object.entries(byStage).sort((a, b) => b[1].tpv - a[1].tpv).map(([k, v]) => ({ stage: k, ...v })),
  });
}
