const GIST_TOKEN = process.env.NEXT_PUBLIC_GIST_TOKEN || '';
const GIST_FILENAME = 'task-inbox-v1.json';
let GIST_ID: string | null = null;

async function getOrCreateGist(): Promise<string> {
  if (GIST_ID) return GIST_ID;

  // Check localStorage for cached gist ID
  const cached = localStorage.getItem('task-inbox-gist-id');
  if (cached) { GIST_ID = cached; return cached; }

  // List gists to find existing one
  const res = await fetch('https://api.github.com/gists', {
    headers: { Authorization: `token ${GIST_TOKEN}`, 'Content-Type': 'application/json' },
  });
  const gists = await res.json();
  const existing = gists.find((g: { files: Record<string, unknown> }) => g.files[GIST_FILENAME]);
  if (existing) {
    GIST_ID = existing.id;
    localStorage.setItem('task-inbox-gist-id', existing.id);
    return existing.id;
  }

  // Create new gist
  const create = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: { Authorization: `token ${GIST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'Task Inbox — Jamie & Torti',
      public: false,
      files: { [GIST_FILENAME]: { content: '[]' } },
    }),
  });
  const created = await create.json();
  GIST_ID = created.id;
  localStorage.setItem('task-inbox-gist-id', created.id);
  return created.id;
}

export async function loadFromGist(): Promise<unknown[] | null> {
  try {
    const id = await getOrCreateGist();
    const res = await fetch(`https://api.github.com/gists/${id}`, {
      headers: { Authorization: `token ${GIST_TOKEN}` },
    });
    const gist = await res.json();
    const content = gist.files?.[GIST_FILENAME]?.content;
    return content ? JSON.parse(content) : null;
  } catch (e) {
    console.error('Gist load failed:', e);
    return null;
  }
}

export async function saveToGist(tasks: unknown[]): Promise<void> {
  try {
    const id = await getOrCreateGist();
    await fetch(`https://api.github.com/gists/${id}`, {
      method: 'PATCH',
      headers: { Authorization: `token ${GIST_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: { [GIST_FILENAME]: { content: JSON.stringify(tasks) } } }),
    });
  } catch (e) {
    console.error('Gist save failed:', e);
  }
}
