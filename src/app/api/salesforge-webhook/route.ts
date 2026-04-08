import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://njurvodprrzvcutbrqnl.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_KEY || ''
);

// Webhook secret for basic verification (optional but recommended)
const WEBHOOK_SECRET = process.env.SALESFORGE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    // Optional signature verification
    if (WEBHOOK_SECRET) {
      const signature = req.headers.get('x-salesforge-signature') || '';
      if (signature !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const body = await req.json();

    // Salesforge webhook payload structure:
    // { event: 'email.sent' | 'email.opened' | 'email.replied' | 'email.bounced', data: {...} }
    const event = body.event || body.type || 'unknown';
    const data = body.data || body;

    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      event_type: event,
      sequence_id: data.sequenceId || data.sequence_id || null,
      sequence_name: data.sequenceName || data.sequence_name || null,
      contact_id: data.leadId || data.contactId || data.contact_id || null,
      contact_email: data.email || data.contactEmail || null,
      workspace_id: data.workspaceId || data.workspace_id || null,
      mailbox: data.mailbox || data.fromEmail || data.from_email || null,
      occurred_at: data.timestamp || data.occurredAt || data.occurred_at || new Date().toISOString(),
      raw: body,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('salesforge_events')
      .insert(record);

    if (error) {
      console.error('Supabase insert error:', error);
      // Still return 200 so Salesforge doesn't retry forever
      return NextResponse.json({ ok: true, warning: 'DB write failed' });
    }

    return NextResponse.json({ ok: true, event, id: record.id });
  } catch (e) {
    console.error('Webhook error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: 'salesforge-webhook' });
}
