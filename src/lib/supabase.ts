import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://njurvodprrzvcutbrqnl.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ROW_ID = 'tasks-v1';

export async function loadFromSupabase(): Promise<unknown[] | null> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('data')
      .eq('id', ROW_ID)
      .single();
    if (error || !data) return null;
    return data.data as unknown[];
  } catch {
    return null;
  }
}

export async function saveToSupabase(tasks: unknown[]): Promise<void> {
  try {
    await supabase
      .from('tasks')
      .upsert({ id: ROW_ID, data: tasks, updated_at: new Date().toISOString() });
  } catch (e) {
    console.error('Supabase save failed:', e);
  }
}
