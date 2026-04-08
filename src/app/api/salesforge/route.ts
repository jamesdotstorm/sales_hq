import { NextResponse } from 'next/server';

const API_KEY = '9afda64cfb4e8f2c633a348f97a91ef5ebbfe14bbddc2ea977473b4b2f78c68f';
const WS_ID = 'wks_fygolivqs29tm57j05j1r';
const BASE = `https://api.salesforge.ai/public/v2/workspaces/${WS_ID}`;
const HDR = { authorization: API_KEY };

async function fetchAllSequences() {
  const r = await fetch(`${BASE}/sequences?limit=50`, { headers: HDR, next: { revalidate: 300 } });
  if (!r.ok) throw new Error('Failed to fetch sequences');
  const data = await r.json();

  // Enrich new-style IDs with full stats
  const sequences = await Promise.all(
    data.data.map(async (s: Record<string, unknown>) => {
      const sid = s.id as string;
      if (sid.startsWith('seq_')) {
        const r2 = await fetch(`${BASE}/sequences/${sid}`, { headers: HDR, next: { revalidate: 300 } });
        if (r2.ok) return r2.json();
      }
      return s;
    })
  );
  return sequences;
}

async function fetchMailboxes() {
  const r = await fetch(`${BASE}/mailboxes?limit=20`, { headers: HDR, next: { revalidate: 300 } });
  if (!r.ok) return [];
  const data = await r.json();
  return data.data || [];
}

export async function GET() {
  try {
    const [sequences, mailboxes] = await Promise.all([fetchAllSequences(), fetchMailboxes()]);

    // Compute summary stats
    const active = sequences.filter((s: Record<string, unknown>) => s.status === 'active');
    const completed = sequences.filter((s: Record<string, unknown>) => s.status === 'completed');
    const draft = sequences.filter((s: Record<string, unknown>) => s.status === 'draft');

    const totalLeads = sequences.reduce((n: number, s: Record<string, unknown>) => n + ((s.leadCount as number) || 0), 0);
    const totalContacted = sequences.reduce((n: number, s: Record<string, unknown>) => n + ((s.contactedCount as number) || 0), 0);
    const totalReplied = sequences.reduce((n: number, s: Record<string, unknown>) => n + ((s.repliedCount as number) || 0), 0);
    const totalOpened = sequences.reduce((n: number, s: Record<string, unknown>) => n + ((s.openedCount as number) || 0), 0);

    const overallReplyRate = totalContacted > 0 ? ((totalReplied / totalContacted) * 100).toFixed(1) : '0';
    const overallOpenRate = totalContacted > 0 ? ((totalOpened / totalContacted) * 100).toFixed(1) : '0';

    return NextResponse.json({
      summary: {
        totalSequences: sequences.length,
        activeSequences: active.length,
        completedSequences: completed.length,
        draftSequences: draft.length,
        totalLeads,
        totalContacted,
        totalReplied,
        totalOpened,
        overallReplyRate,
        overallOpenRate,
        totalMailboxes: mailboxes.length,
      },
      sequences: sequences.map((s: Record<string, unknown>) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        leadCount: s.leadCount || 0,
        contactedCount: s.contactedCount || 0,
        openedCount: s.openedCount || 0,
        openedPercent: s.openedPercent || 0,
        repliedCount: s.repliedCount || 0,
        repliedPercent: s.repliedPercent || 0,
        repliedPositiveCount: s.repliedPositiveCount || 0,
        repliedNegativeCount: s.repliedNegativeCount || 0,
        bouncedCount: s.bouncedCount || 0,
        unsubscribedCount: s.unsubscribedCount || 0,
      })),
      mailboxes: mailboxes.map((m: Record<string, unknown>) => ({
        id: m.id,
        address: m.address,
        firstName: m.firstName,
        lastName: m.lastName,
        warmupEnabled: m.warmupEnabled,
      })),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
