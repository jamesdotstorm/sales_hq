import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY!;
const SETTINGS_ID = 'sales-hq-settings';

async function getSettings() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/tasks?id=eq.${SETTINGS_ID}`,
    { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, cache: 'no-store' }
  );
  const rows = await res.json();
  if (rows && rows[0]) return rows[0].data || {};
  return {};
}

export async function GET() {
  try {
    const data = await getSettings();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({}, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await fetch(
      `${SUPABASE_URL}/rest/v1/tasks?id=eq.${SETTINGS_ID}`,
      {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: body }),
      }
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
