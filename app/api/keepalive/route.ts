import { NextResponse } from 'next/server';
import { createClient, supabaseConfigured } from '@/lib/supabase/server';

// Called once a day by Vercel so the free database never pauses from inactivity (e.g. over summer).
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!supabaseConfigured()) return NextResponse.json({ ok: false });
  const supabase = await createClient();
  const { error } = await supabase.from('albums').select('id', { count: 'exact', head: true });
  return NextResponse.json({ ok: !error });
}
