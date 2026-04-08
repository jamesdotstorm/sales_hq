import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://njurvodprrzvcutbrqnl.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || ''
);

function getDateRange(range: string): { from: string; to: string } {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const toISO = (d: Date) => d.toISOString();

  if (range === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { from: toISO(start), to: toISO(now) };
  }

  if (range === 'week') {
    // Monday of current week
    const day = now.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day; // Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return { from: toISO(monday), to: toISO(now) };
  }

  if (range === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: toISO(start), to: toISO(now) };
  }

  // all — last 365 days
  const start = new Date(now);
  start.setFullYear(start.getFullYear() - 1);
  return { from: toISO(start), to: toISO(now) };
}

export async function GET(req: NextRequest) {
  const range = req.nextUrl.searchParams.get('range') || 'month';
  const { from, to } = getDateRange(range);

  try {
    const { data, error } = await supabase
      .from('salesforge_events')
      .select('event_type, sequence_id, sequence_name, occurred_at')
      .gte('occurred_at', from)
      .lte('occurred_at', to)
      .order('occurred_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message, tableExists: false }, { status: 200 });
    }

    const events = data || [];

    // Aggregate by event type
    const counts: Record<string, number> = {
      'email.sent': 0,
      'email.opened': 0,
      'email.replied': 0,
      'email.bounced': 0,
    };

    // Aggregate by sequence
    const bySequence: Record<string, { name: string; sent: number; opened: number; replied: number; bounced: number }> = {};

    for (const e of events) {
      const type = e.event_type as string;
      if (type in counts) counts[type]++;

      const seqId = e.sequence_id || 'unknown';
      if (!bySequence[seqId]) {
        bySequence[seqId] = { name: e.sequence_name || seqId, sent: 0, opened: 0, replied: 0, bounced: 0 };
      }
      if (type === 'email.sent') bySequence[seqId].sent++;
      if (type === 'email.opened') bySequence[seqId].opened++;
      if (type === 'email.replied') bySequence[seqId].replied++;
      if (type === 'email.bounced') bySequence[seqId].bounced++;
    }

    const sent = counts['email.sent'];
    const replyRate = sent > 0 ? ((counts['email.replied'] / sent) * 100).toFixed(1) : '0';
    const openRate = sent > 0 ? ((counts['email.opened'] / sent) * 100).toFixed(1) : '0';

    return NextResponse.json({
      range,
      from,
      to,
      totalEvents: events.length,
      tableExists: true,
      summary: {
        sent: counts['email.sent'],
        opened: counts['email.opened'],
        replied: counts['email.replied'],
        bounced: counts['email.bounced'],
        replyRate,
        openRate,
      },
      bySequence: Object.entries(bySequence)
        .map(([id, s]) => ({ id, ...s }))
        .sort((a, b) => b.sent - a.sent),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
